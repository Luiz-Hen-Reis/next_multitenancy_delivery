import { NextApiHandler } from "next";
import prisma from "../../../libs/prisma";
import bcrypt from "bcrypt";

const handler: NextApiHandler = async (req, res) => {
  const { tenant, password, email } = req.body;

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
      status: 'tenant created',
      tenant: {
        id: createdTenant?.id,
        tenant: createdTenant?.tenant,
        email: createdTenant?.email,
        isMember: createdTenant?.isMember,
        createdAt: createdTenant?.createdAt
      }
    });
  }

  return res
    .status(200)
    .send({
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
