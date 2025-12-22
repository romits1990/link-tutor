import { prisma } from '@/app/lib/prisma';

async function main() {
  console.log('Start seeding...')

  const users = [
    {
      id: "cmjgq07c40000m4hjc0dyq1bk",
      name: 'Romit Sanyal',
      email: 'sanyalromit1990@gmail.com',
      image: 'https://lh3.googleusercontent.com/a/ACg8ocLKGtdR-7nPWa0Wq-25CH2uVS1D3AhxMOoqE8YQrlbrPdsazA=s96-c',
    }
  ]

  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    })
    console.log(`Created user with id: ${user.id}`)
  }

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })