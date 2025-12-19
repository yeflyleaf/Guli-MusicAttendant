!macro customInit
  ; 尝试设置默认安装目录为 "D:\GL_Music" (如果 D 盘存在)
  ; 否则使用 electron-builder 的默认路径 (用户目录，无需管理员权限)
  
  ; 检查 D 盘是否存在
  IfFileExists "D:\" 0 +2
    StrCpy $INSTDIR "D:\GL_Music"
    
  ; 如果 D 盘不存在，什么都不做，保持默认值 ($LOCALAPPDATA\Programs\GL_Music)
!macroend

!macro customInstall
  ; --- 路径自动补全逻辑已移除 ---
  ; 不再在文档目录创建文件夹，避免写入 C 盘
!macroend
