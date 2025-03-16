export default () => ({
  secret: process.env.SECRET,
  refreshSecret: process.env.SECRET_REFRESH,
  detectApiUrl: process.env.DETECT_API_URL,
})
