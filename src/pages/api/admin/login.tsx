import { NextApiHandler } from "next";
import prisma from "../../../libs/prisma";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


const ADMIN_TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET;

const handler: NextApiHandler = async (req, res) => {
  const { name, password } = req.body;

  const admin = await prisma.admin.findFirst({ where: { name } });

  if (admin && await bcrypt.compare(password, admin.password)) {
    const token = jwt.sign(
      { id: admin?.id, name: admin?.name },
      ADMIN_TOKEN_SECRET as string
    );

    res.json({
      token,
      admin: {
        id: admin?.id,
        name: admin?.name,
      },
    });
  }

  res.status(200).json({ status: 'This Admin does not exist' })
};

export default handler;
