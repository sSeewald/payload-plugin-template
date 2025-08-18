import type { PayloadHandler } from 'payload'

export const helloWorldHandler: PayloadHandler = (req) => {
  return Response.json({
    headers: {
      'user-agent': req.headers.get('user-agent'),
    },
    message: 'Hello World!',
    method: req.method,
    timestamp: new Date().toISOString(),
  })
}