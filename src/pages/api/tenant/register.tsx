import { NextApiHandler } from "next";
import prisma from "../../../libs/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const ADMIN_TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET;

const handler: NextApiHandler = async (req, res) => {
  const { tenant, password, email } = req.body;
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).send({ status: "Forbidden" });

  jwt.verify(token, ADMIN_TOKEN_SECRET as string, (err) => {
    if (err) return res.status(403).send({ status: "You do not have access" });
  });

  const tenantAlreadyExist = await prisma.tenant.findFirst({
    where: { tenant },
  });

  if (!tenantAlreadyExist) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.tenant.create({
      data: {
        tenant,
        email,
        password: hashedPassword,
      },
    });

    const createdTenant = await prisma.tenant.findFirst({ where: { email } });
    res.status(201).json({
      status: "tenant created",
      tenant: {
        id: createdTenant?.id,
        tenant: createdTenant?.tenant,
        email: createdTenant?.email,
        isMember: createdTenant?.isMember,
        createdAt: createdTenant?.createdAt,
      },
    });
  }

  return res.status(200).send({
    status: "tenant already exists",
    tenant: {
      id: tenantAlreadyExist?.id,
      tenant: tenantAlreadyExist?.tenant,
      email: tenantAlreadyExist?.email,
      isMember: tenantAlreadyExist?.isMember,
    },
  });
};

export default handler;
