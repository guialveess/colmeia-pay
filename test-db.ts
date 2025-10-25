import postgres from 'postgres'
import 'dotenv/config'

async function test() {
  const client = postgres(process.env.DATABASE_URL!, { ssl: 'require' })
  await client`SELECT NOW()`
  console.log('✅ Conexão com o Supabase OK!')
  await client.end()
}

test().catch(err => {
  console.error('❌ Erro na conexão:', err.message)
})
