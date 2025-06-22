import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: 'hashedpassword123', // Use bcrypt in real apps!
      name: 'Test User',
    },
  });

  await prisma.competition.create({
    data: {
      title: 'AI Hackathon 2025',
      description: 'A competition for AI enthusiasts.',
      deadline: new Date('2025-06-01T23:59:59Z'),
      location: 'San Francisco, USA',
      eligibility: 'Open to all students',
      prizes: 'Cash prize + internship',
      registrationLink: 'https://example.com/register',
      imageUrl: 'https://example.com/image.jpg',
    },
  });

  console.log('✅ Seed data inserted');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
