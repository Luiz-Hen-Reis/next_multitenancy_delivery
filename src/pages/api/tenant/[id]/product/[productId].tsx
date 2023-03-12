import { NextApiHandler } from "next"

const handler: NextApiHandler =  (req, res) => {

  res.json({ ping: 'pong' });
} 

export default handler;