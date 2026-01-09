'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, Check, Crop as CropIcon } from 'lucide-react'

interface AvatarUploadProps {
  currentAvatar?: string
  onAvatarChange: (avatarFile: File | null) => void
}

/**
 * 頭像上傳與裁切元件
 * 上傳後可以裁切，確認後存在前端，等使用者點送出才上傳到後端
 */
export function AvatarUpload({ currentAvatar, onAvatarChange }: AvatarUploadProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(currentAvatar || null)
  const [showCropModal, setShowCropModal] = useState(false)
  const [tempImageFile, setTempImageFile] = useState<File | null>(null)
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0, scale: 1 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const imgRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 固定圓形裁切框大小（像素）
  const CROP_SIZE = 400

  // 當 currentAvatar 改變時更新 imageSrc
  useEffect(() => {
    if (currentAvatar) {
      setImageSrc(currentAvatar)
    }
  }, [currentAvatar])

  // 載入圖片
  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setTempImageFile(file)

      const reader = new FileReader()
      reader.addEventListener('load', () => {
        setImageSrc(reader.result as string)
        setShowCropModal(true)
      })
      reader.readAsDataURL(file)
    }
  }

  // 初始化圖片位置（居中）
  const onImageLoad = useCallback(() => {
    if (!imgRef.current || !containerRef.current) return

    const img = imgRef.current
    const containerWidth = containerRef.current.offsetWidth
    const containerHeight = containerRef.current.offsetHeight

    // 計算圖片在容器中的顯示尺寸（保持比例）
    const imgAspect = img.naturalWidth / img.naturalHeight
    let displayWidth = containerWidth
    let displayHeight = containerWidth / imgAspect

    if (displayHeight > containerHeight) {
      displayHeight = containerHeight
      displayWidth = containerHeight * imgAspect
    }

    // 設置圖片的顯示尺寸
    img.style.width = `${displayWidth}px`
    img.style.height = `${displayHeight}px`

    // 計算初始縮放比例，確保圖片能覆蓋整個圓形區域
    const scale = Math.max(CROP_SIZE / displayWidth, CROP_SIZE / displayHeight) * 1.2

    // 居中對齊
    setImagePosition({
      x: 0,
      y: 0,
      scale
    })
  }, [])

  // 處理圖片拖動
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX - imagePosition.x,
      y: e.clientY - imagePosition.y
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    setImagePosition({
      ...imagePosition,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // 處理滾輪縮放
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newScale = Math.max(0.5, Math.min(3, imagePosition.scale * delta))

    setImagePosition({
      ...imagePosition,
      scale: newScale
    })
  }

  // 確認裁切
  const handleConfirmCrop = () => {
    if (!imgRef.current || !tempImageFile || !containerRef.current) return

    const canvas = document.createElement('canvas')
    canvas.width = CROP_SIZE
    canvas.height = CROP_SIZE
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    // 創建圓形裁切路徑
    ctx.beginPath()
    ctx.arc(CROP_SIZE / 2, CROP_SIZE / 2, CROP_SIZE / 2, 0, Math.PI * 2)
    ctx.clip()

    const imgElement = imgRef.current
    const containerRect = containerRef.current.getBoundingClientRect()

    // 容器中心點（相對於容器本身）
    const containerCenterX = containerRect.width / 2
    const containerCenterY = containerRect.height / 2

    // 圓形裁切框的中心點（在容器中的位置，固定）
    const cropCenterX = containerCenterX
    const cropCenterY = containerCenterY

    // 圖片在容器中的顯示尺寸
    const imgDisplayWidth = imgElement.width * imagePosition.scale
    const imgDisplayHeight = imgElement.height * imagePosition.scale

    // 圖片左上角在容器中的位置
    const imgLeft = containerCenterX - imgDisplayWidth / 2 + imagePosition.x
    const imgTop = containerCenterY - imgDisplayHeight / 2 + imagePosition.y

    // 圓形區域相對於圖片左上角的位置
    const cropRelativeX = cropCenterX - imgLeft
    const cropRelativeY = cropCenterY - imgTop

    // 轉換到原始圖片坐標
    const scaleRatio = imgElement.naturalWidth / imgElement.width
    const cropSizeInImage = (CROP_SIZE / imagePosition.scale) * scaleRatio
    const cropXInImage = (cropRelativeX / imagePosition.scale) * scaleRatio
    const cropYInImage = (cropRelativeY / imagePosition.scale) * scaleRatio

    // 繪製圖片
    ctx.drawImage(
      imgElement,
      cropXInImage - cropSizeInImage / 2,
      cropYInImage - cropSizeInImage / 2,
      cropSizeInImage,
      cropSizeInImage,
      0,
      0,
      CROP_SIZE,
      CROP_SIZE
    )

    // 轉換為 Blob 然後 File
    canvas.toBlob((blob) => {
      if (!blob) return
      const croppedFile = new File([blob], tempImageFile.name, {
        type: tempImageFile.type,
        lastModified: Date.now(),
      })

      onAvatarChange(croppedFile)

      // 更新預覽
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        setImageSrc(reader.result as string)
      })
      reader.readAsDataURL(croppedFile)

      setShowCropModal(false)
    }, tempImageFile.type, 1.0)
  }

  // 取消裁切
  const handleCancelCrop = () => {
    setShowCropModal(false)
    // 恢復到原本的頭像（如果有）
    setImageSrc(currentAvatar || null)
    setTempImageFile(null)
    setImagePosition({ x: 0, y: 0, scale: 1 })
    // 清除暫存的檔案選擇
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    // 清除暫存的檔案（不觸發上傳）
    onAvatarChange(null)
  }

  // 移除頭像
  const handleRemoveAvatar = () => {
    setImageSrc(null)
    onAvatarChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {/* 頭像預覽 */}
        <div className="relative">
          <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt="頭像預覽"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <span className="text-2xl font-semibold text-primary">
                  {currentAvatar ? 'U' : '?'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 上傳按鈕 */}
        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onSelectFile}
            className="hidden"
          />
          <motion.button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Upload className="h-4 w-4" />
            {imageSrc ? '更換頭像' : '上傳頭像'}
          </motion.button>
          {imageSrc && (
            <button
              type="button"
              onClick={handleRemoveAvatar}
              className="text-sm text-muted-foreground hover:text-destructive transition-colors"
            >
              移除頭像
            </button>
          )}
        </div>
      </div>

      {/* 裁切模態框 */}
      <AnimatePresence>
        {showCropModal && imageSrc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-background rounded-lg border p-6 max-w-[600px] w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <CropIcon className="h-5 w-5" />
                  裁切頭像
                </h3>
                <button
                  onClick={handleCancelCrop}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 flex-1 flex flex-col min-h-0">
                <div className="flex justify-center items-center flex-1 min-h-0 overflow-hidden">
                  <div
                    ref={containerRef}
                    className="relative w-full max-w-[500px] max-h-[500px] aspect-square flex items-center justify-center cursor-move"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onWheel={handleWheel}
                  >
                    {/* 固定圓形裁切框 */}
                    <div
                      className="absolute rounded-full border-2 border-white shadow-lg z-10 pointer-events-none"
                      style={{
                        width: `${CROP_SIZE}px`,
                        height: `${CROP_SIZE}px`,
                        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
                      }}
                    />

                    {/* 可拖動的圖片 */}
                    <img
                      ref={imgRef}
                      alt="裁切預覽"
                      src={imageSrc}
                      onLoad={onImageLoad}
                      className="select-none"
                      style={{
                        transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${imagePosition.scale})`,
                        transformOrigin: 'center center',
                        cursor: isDragging ? 'grabbing' : 'grab',
                        userSelect: 'none',
                        pointerEvents: 'none'
                      }}
                      draggable={false}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 flex-shrink-0">
                  <button
                    onClick={handleCancelCrop}
                    className="px-4 py-2 border rounded-md hover:bg-accent transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleConfirmCrop}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                    確認
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

