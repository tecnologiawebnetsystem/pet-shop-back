const multer = require("multer")
const path = require("path")
const crypto = require("crypto")
const fs = require("fs")
const AppError = require("../utils/AppError")

// Verifica se o diretório de uploads existe, se não, cria
const uploadFolder = process.env.UPLOAD_FOLDER || "uploads"
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true })
}

// Configuração para imagens de pets
const petStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = path.join(uploadFolder, "pets")
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true })
    }
    cb(null, folder)
  },
  filename: (req, file, cb) => {
    crypto.randomBytes(16, (err, hash) => {
      if (err) cb(err)

      const fileName = `${hash.toString("hex")}-${file.originalname}`
      cb(null, fileName)
    })
  },
})

// Configuração para imagens de produtos
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = path.join(uploadFolder, "produtos")
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true })
    }
    cb(null, folder)
  },
  filename: (req, file, cb) => {
    crypto.randomBytes(16, (err, hash) => {
      if (err) cb(err)

      const fileName = `${hash.toString("hex")}-${file.originalname}`
      cb(null, fileName)
    })
  },
})

// Filtro para permitir apenas imagens
const fileFilter = (req, file, cb) => {
  const allowedMimes = ["image/jpeg", "image/pjpeg", "image/png", "image/gif"]

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new AppError("Formato de arquivo inválido. Apenas imagens são permitidas.", 400))
  }
}

const maxSize = process.env.MAX_FILE_SIZE || 5 * 1024 * 1024 // 5MB por padrão

module.exports = {
  petUpload: multer({
    storage: petStorage,
    fileFilter,
    limits: {
      fileSize: maxSize,
    },
  }),
  productUpload: multer({
    storage: productStorage,
    fileFilter,
    limits: {
      fileSize: maxSize,
    },
  }),
}
