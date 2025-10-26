# Create simple PNG icons using .NET
Add-Type -AssemblyName System.Drawing

function Create-Icon {
    param([int]$size, [string]$path)
    
    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    
    # Fill background with blue gradient
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        [System.Drawing.Point]::new(0, 0),
        [System.Drawing.Point]::new($size, $size),
        [System.Drawing.Color]::FromArgb(59, 130, 246),
        [System.Drawing.Color]::FromArgb(147, 51, 234)
    )
    $graphics.FillRectangle($brush, 0, 0, $size, $size)
    
    # Add shield emoji or text
    $font = New-Object System.Drawing.Font("Segoe UI Emoji", ($size * 0.6), [System.Drawing.FontStyle]::Bold)
    $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $stringFormat = New-Object System.Drawing.StringFormat
    $stringFormat.Alignment = [System.Drawing.StringAlignment]::Center
    $stringFormat.LineAlignment = [System.Drawing.StringAlignment]::Center
    
    $graphics.DrawString("P", $font, $textBrush, ($size / 2), ($size / 2), $stringFormat)
    
    # Save
    $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $graphics.Dispose()
    $bitmap.Dispose()
}

# Create icons
Create-Icon 16 "public\icon16.png"
Create-Icon 48 "public\icon48.png"
Create-Icon 128 "public\icon128.png"

Write-Host "✅ Icons created successfully" -ForegroundColor Green
