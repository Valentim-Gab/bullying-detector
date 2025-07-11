import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthGuard } from '@nestjs/passport'
import * as jwt from 'jsonwebtoken'
import { ErrorConstants } from 'src/constants/error.constant'

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
  constructor(private config: ConfigService) {
    super()
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      let refreshToken = this.extractRefreshTokenFromBody(context)
      let accessToken = this.extractTokenFromAuthHeader(context)

      if (!accessToken && !refreshToken) {
        const tokens = this.extractTokensFromCookies(context)

        refreshToken = tokens.refreshToken ?? null
        accessToken = tokens.accessToken ?? null
      }

      if (accessToken) {
        try {
          const decodedToken = jwt.decode(accessToken) as jwt.JwtPayload

          if (!decodedToken) {
            throw new UnauthorizedException(
              'Token de acesso inválido',
              ErrorConstants.INVALID_TOKEN,
            )
          }

          user = {
            id: decodedToken.sub,
            username: decodedToken.username,
            role: decodedToken.role,
          }
        } catch (error) {
          throw new UnauthorizedException(
            'Erro ao decodificar o token',
            ErrorConstants.INVALID_TOKEN,
          )
        }
      } else {
        throw new UnauthorizedException(
          'Não autenticado',
          ErrorConstants.UNAUTHENTICATED,
        )
      }

      if (refreshToken) {
        try {
          jwt.verify(refreshToken, this.config.get('refreshSecret'))
        } catch (error) {
          if (error instanceof jwt.TokenExpiredError) {
            throw new UnauthorizedException(
              'Sessão expirada',
              ErrorConstants.SESSION_EXPIRED,
            )
          }
          throw new UnauthorizedException(
            'Token de refresh inválido',
            ErrorConstants.INVALID_TOKEN,
          )
        }
      } else {
        throw new UnauthorizedException(
          'Não autenticado',
          ErrorConstants.UNAUTHENTICATED,
        )
      }
    }

    return user
  }

  private extractRefreshTokenFromBody(context: ExecutionContext): string {
    const request = context.switchToHttp().getRequest()
    return request.body?.refreshToken ?? null
  }

  private extractTokenFromAuthHeader(context: ExecutionContext): string {
    const request = context.switchToHttp().getRequest()
    const authHeader = request.headers.authorization

    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7)
    }

    return null
  }

  private extractTokensFromCookies(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest()
    return request.cookies ?? {}
  }
}
