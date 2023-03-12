import { NextApiHandler } from "next";
import prisma from "../../../libs/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const ADMIN_TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET;

const handler: NextApiHandler = async (req, res) => {
  const { name, password } = req.body;

  const adminAlreadyExists = await prisma.admin.findFirst({ where: { name } });

  if (!adminAlreadyExists) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.admin.create({
      data: {
        name,
        password: hashedPassword,
      },
    });

    const admin = await prisma.admin.findFirst({ where: { name } });
    const token = jwt.sign(
      { id: admin?.id, name: admin?.name },
      ADMIN_TOKEN_SECRET as string
    );

    res.status(201).json({
      token,
      admin: {
        name: admin?.name,
      },
    });
  }

  res.status(200).json({ status: "Admin already registered" });
};

export default handler;
