import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // First create a test user who will be the organizer
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: 'hashedpassword123', // Use bcrypt in real apps!
      name: 'Test User',
      role: 'BUSINESS', // Assuming this organizer should be a business user
    },
  });

  // Create competition with associated prize
  await prisma.competition.create({
    data: {
      title: 'AI Hackathon 2025',
      description: 'A competition for AI enthusiasts.',
      contactEmail: 'contact@example.com',
      organizerId: user.id, // Use the ID of the user we just created
      startDate: new Date('2025-05-01'),
      endDate: new Date('2025-06-01'),
      prize: 'Cash prizes and internships', // Added the required prize field
      rules: 'Standard competition rules apply',
      organizerName: 'Test Organizer',
      categories: ['AI', 'Technology'],
      prizes: {
        create: [
          {
            name: 'Grand Prize',
            description: 'Cash prize + internship',
            value: '$10,000',
            position: 1
          }
        ]
      },
      // Optional fields
      coverImage: 'https://example.com/image.jpg',
      website: 'https://example.com'
    },
  });

  console.log('✅ Seed data inserted');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });