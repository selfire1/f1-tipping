import { db } from '../server/utils/db'
import path from 'path'

async function main() {
  const rootPath = path.join(import.meta.dir, '..')
  const userImgsPath = path.join(rootPath, 'public', 'img', 'user')

  const users = await db.query.user.findMany({
    columns: {
      image: true,
      id: true,
    },
  })
  console.log('Got', users.length, 'users')
  const [user] = users
  if (!user?.image) {
    console.log('No image for', user)
    return
  }
  const response = await fetch(user.image)
  const arrayBuffer = await response.arrayBuffer()
  const filePath = path.join(userImgsPath, `${user.id}.png`)
  await Bun.write(filePath, new Uint8Array(arrayBuffer))
}

main()
