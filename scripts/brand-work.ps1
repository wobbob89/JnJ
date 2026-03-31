Add-Type -AssemblyName System.Drawing

function Get-RotateFlipType([int]$orientation) {
  switch ($orientation) {
    2 { return [System.Drawing.RotateFlipType]::RotateNoneFlipX }
    3 { return [System.Drawing.RotateFlipType]::Rotate180FlipNone }
    4 { return [System.Drawing.RotateFlipType]::Rotate180FlipX }
    5 { return [System.Drawing.RotateFlipType]::Rotate90FlipX }
    6 { return [System.Drawing.RotateFlipType]::Rotate90FlipNone }
    7 { return [System.Drawing.RotateFlipType]::Rotate270FlipX }
    8 { return [System.Drawing.RotateFlipType]::Rotate270FlipNone }
    default { return [System.Drawing.RotateFlipType]::RotateNoneFlipNone }
  }
}

function Save-BrandedImage([string]$src, [string]$dst, [string]$logoPath) {
  $img = [System.Drawing.Image]::FromFile((Resolve-Path $src))
  $logo = [System.Drawing.Image]::FromFile((Resolve-Path $logoPath))

  try {
    if ($img.PropertyIdList -contains 0x0112) {
      $prop = $img.GetPropertyItem(0x0112)
      $orientation = [BitConverter]::ToUInt16($prop.Value, 0)
      $img.RotateFlip((Get-RotateFlipType $orientation))
    }

    $maxDimension = 1800.0
    $scale = [Math]::Min(1.0, $maxDimension / [Math]::Max($img.Width, $img.Height))
    $width = [int][Math]::Round($img.Width * $scale)
    $height = [int][Math]::Round($img.Height * $scale)

    $bmp = [System.Drawing.Bitmap]::new($width, $height, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
    $graphics = [System.Drawing.Graphics]::FromImage($bmp)

    try {
      $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
      $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
      $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
      $graphics.Clear([System.Drawing.Color]::FromArgb(6, 8, 6))
      $graphics.DrawImage($img, 0, 0, $width, $height)

      $panelWidth = [int][Math]::Min(230, [Math]::Max(140, $width * 0.18))
      $panelHeight = [int][Math]::Round($panelWidth * 0.62)
      $margin = [int][Math]::Max(18, $width * 0.025)

      $panelRect = [System.Drawing.Rectangle]::new(
        [int]($width - $panelWidth - $margin),
        [int]($height - $panelHeight - $margin),
        $panelWidth,
        $panelHeight
      )

      $shadowRect = [System.Drawing.Rectangle]::new(
        [int]($panelRect.X + 4),
        [int]($panelRect.Y + 6),
        $panelRect.Width,
        $panelRect.Height
      )

      $shadowBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(60, 0, 0, 0))
      $panelBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(220, 7, 9, 7))
      $borderPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(180, 184, 214, 59), 2)

      try {
        $graphics.FillRectangle($shadowBrush, $shadowRect)
        $graphics.FillRectangle($panelBrush, $panelRect)
        $graphics.DrawRectangle($borderPen, $panelRect)
      }
      finally {
        $shadowBrush.Dispose()
        $panelBrush.Dispose()
        $borderPen.Dispose()
      }

      $logoInset = [int][Math]::Round($panelWidth * 0.08)
      $logoRect = [System.Drawing.Rectangle]::new(
        [int]($panelRect.X + $logoInset),
        [int]($panelRect.Y + $logoInset),
        [int]($panelRect.Width - ($logoInset * 2)),
        [int]($panelRect.Height - ($logoInset * 2))
      )

      $graphics.DrawImage($logo, $logoRect)
    }
    finally {
      $graphics.Dispose()
    }

    $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
    $encParams = [System.Drawing.Imaging.EncoderParameters]::new(1)
    $encParams.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::Quality, 86L)

    try {
      $bmp.Save((Join-Path (Get-Location) $dst), $encoder, $encParams)
    }
    finally {
      $encParams.Dispose()
      $bmp.Dispose()
    }
  }
  finally {
    $img.Dispose()
    $logo.Dispose()
  }
}

$destDir = "assets\\branded-work"
New-Item -ItemType Directory -Force -Path $destDir | Out-Null
Get-ChildItem $destDir -File | Remove-Item -Force

$logoPath = 'assets\\J$Js logo.png'
$map = [ordered]@{
  "extension-shell.jpg" = "assets\\Work\\site pics\\20200214_160835.jpg"
  "brick-extension.jpg" = "assets\\Work\\site pics\\20200130_122105.jpg"
  "patio-finish.jpg" = "assets\\Work\\site pics\\20200501_154208.jpg"
  "roofing-finish.jpg" = "assets\\Work\\site pics\\20200910_085650.jpg"
  "kitchen-fitout.jpg" = "assets\\Work\\site pics\\IMG-20201127-WA0003.jpg"
  "porch-finish.jpg" = "assets\\Work\\site pics\\26165857_1726233200752894_393623261894320041_n.jpg"
}

foreach ($name in $map.Keys) {
  Save-BrandedImage $map[$name] (Join-Path $destDir $name) $logoPath
}

Get-ChildItem $destDir -File | Select-Object Name, Length | Sort-Object Name

