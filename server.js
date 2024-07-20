// backend/server.js
const express = require('express');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');

const app = express();
const prisma = new PrismaClient();

app.use(bodyParser.json());

app.post('/api/referral', async (req, res) => {
  try {
    const { referrerName, referrerEmail, refereeName, refereeEmail } = req.body;
    if (!referrerName || !referrerEmail || !refereeName || !refereeEmail) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const referral = await prisma.referral.create({
      data: { referrerName, referrerEmail, refereeName, refereeEmail },
    });

    // Send email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: referrerEmail,
      subject: 'Referral Received',
      text: `Thank you for your referral! Referee: ${refereeName} (${refereeEmail})`,
    });

    res.status(200).json(referral);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});