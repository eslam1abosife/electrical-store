// scripts/embed-project.mjs
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

// ============================================
// 1. تحميل متغيرات البيئة بشكل صحيح
// ============================================
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// حمل الـ .env من المجلد الرئيسي
config({ path: join(__dirname, '..', '.env') })

// ============================================
// 2. التحقق من المتغيرات
// ============================================
const SUPABASE_URL = process.env.NUXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY

console.log('🔍 التحقق من المتغيرات:')
console.log('SUPABASE_URL:', SUPABASE_URL ? '✅ موجود' : '❌ غير موجود')
console.log('SUPABASE_SERVICE_KEY:', SUPABASE_SERVICE_KEY ? '✅ موجود' : '❌ غير موجود')
console.log('DEEPSEEK_API_KEY:', DEEPSEEK_API_KEY ? '✅ موجود' : '❌ غير موجود')

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !DEEPSEEK_API_KEY) {
  console.error('❌ خطأ: بعض المتغيرات مفقودة في ملف .env')
  console.error('تأكد من وجود: NUXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DEEPSEEK_API_KEY')
  process.exit(1)
}

// ============================================
// 3. إنشاء عميل Supabase
// ============================================
const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY
)

// ============================================
// 4. باقي الكود (نفس اللي قبل كده)
// ============================================
const IGNORE_DIRS = ['node_modules', '.nuxt', '.git', 'dist', 'build', 'assets', 'public', '.output']
const ALLOWED_EXTENSIONS = ['.js', '.vue', '.ts', '.json', '.css', '.html', '.md', '.mjs', '.tsx', '.jsx']

async function getEmbedding(text) {
  try {
    const response = await fetch('https://api.deepseek.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        input: text,
        model: 'text-embedding-ada-002',
      })
    })
    
    if (!response.ok) {
      console.error('❌ DeepSeek Embedding Error:', await response.text())
      return null
    }
    
    const data = await response.json()
    return data.data[0].embedding
  } catch (error) {
    console.error('❌ Embedding Error:', error.message)
    return null
  }
}

function chunkText(text, maxChunkSize = 800) {
  const chunks = []
  const lines = text.split('\n')
  let currentChunk = ''
  
  for (const line of lines) {
    if ((currentChunk + line).length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk)
      currentChunk = ''
    }
    currentChunk += line + '\n'
  }
  
  if (currentChunk.length > 0) {
    chunks.push(currentChunk)
  }
  
  return chunks
}

function getAllFiles(dir, fileList = []) {
  try {
    const files = readdirSync(dir)
    
    for (const file of files) {
      const filePath = join(dir, file)
      const stat = statSync(filePath)
      
      if (stat.isDirectory()) {
        if (!IGNORE_DIRS.includes(file)) {
          getAllFiles(filePath, fileList)
        }
      } else {
        const ext = extname(file)
        if (ALLOWED_EXTENSIONS.includes(ext)) {
          fileList.push(filePath)
        }
      }
    }
  } catch (error) {
    console.error('❌ Error reading directory:', error.message)
  }
  
  return fileList
}

async function indexProject() {
  console.log('🚀 بدء رفع ملفات المشروع...')
  console.log(`📁 المجلد الحالي: ${process.cwd()}`)
  
  const files = getAllFiles('./')
  console.log(`📁 تم العثور على ${files.length} ملف`)
  
  // خد بس أول 20 ملف عشان التجربة (عشان ما تستهلكش كل الرصيد)
  const filesToProcess = files.slice(0, 20)
  console.log(`📁 هنتعامل مع ${filesToProcess.length} ملف (باقي الملفات هتتضاف بعدين)`)
  
  let successCount = 0
  let failCount = 0
  
  for (const filePath of filesToProcess) {
    try {
      const content = readFileSync(filePath, 'utf-8')
      const chunks = chunkText(content)
      
      for (const chunk of chunks) {
        if (chunk.trim().length === 0) continue
        
        const embedding = await getEmbedding(chunk)
        if (!embedding) continue
        
        const { error } = await supabase.from('documents').insert({
          content: chunk,
          metadata: {
            filename: filePath,
            type: extname(filePath).slice(1),
            size: content.length
          },
          embedding: embedding,
        })
        
        if (error) {
          console.error(`❌ خطأ في رفع ${filePath}:`, error.message)
          failCount++
        } else {
          successCount++
        }
      }
      
      console.log(`✅ تم رفع: ${filePath}`)
    } catch (error) {
      console.error(`❌ خطأ في قراءة ${filePath}:`, error.message)
      failCount++
    }
  }
  
  console.log(`\n✨ انتهى الرفع! نجح: ${successCount} جزء، فشل: ${failCount}`)
  console.log('💡 نصيحة: لو عايز ترفع كل الملفات، غير `files.slice(0, 20)` لـ `files`')
}

// ============================================
// 5. تشغيل السكريبت
// ============================================
indexProject().catch(console.error)