$ErrorActionPreference = 'Stop'
$root = (Get-Location).Path
$files = Get-ChildItem -Recurse -File -Include *.html,*.css,*.js
$lineRx = [regex]'(?<q>["''])(?<path>[^"'']+?)\.(?<ext>png|jpg|jpeg)(?<tail>(\?[^"'']*)?)(?<q2>["''])'
$sitePrefix = 'https://amazonbazarct.com/'

$refs = New-Object System.Collections.Generic.List[object]
foreach ($f in $files) {
  $content = Get-Content -Raw -LiteralPath $f.FullName
  foreach ($m in $lineRx.Matches($content)) {
    $pBase = $m.Groups['path'].Value
    $ext = $m.Groups['ext'].Value
    $p = "$pBase.$ext"
    $tail = $m.Groups['tail'].Value
    $kind = 'skip'
    $abs = $null

    if ($p -match '^https?://') {
      if ($p.StartsWith($sitePrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
        $rel = $p.Substring($sitePrefix.Length) -replace '/', '\\'
        $rel = [System.Uri]::UnescapeDataString($rel)
        $abs = Join-Path $root $rel
        $kind = 'site-absolute'
      } else {
        $kind = 'external'
      }
    } else {
      $rel = $p -replace '/', '\\'
      $abs = [IO.Path]::GetFullPath((Join-Path $f.DirectoryName $rel))
      $kind = 'local'
    }

    $refs.Add([pscustomobject]@{ File=$f.FullName; PathWithExt=$p; Tail=$tail; Kind=$kind; Abs=$abs })
  }
}

$targets = $refs | Where-Object { $_.Kind -in @('local','site-absolute') -and $_.Abs -and (Test-Path -LiteralPath $_.Abs) }
$uniqueSrc = $targets | Select-Object -ExpandProperty Abs -Unique

$converted = 0
$failed = 0
foreach ($src in $uniqueSrc) {
  $dst = [IO.Path]::ChangeExtension($src, 'webp')
  if (-not (Test-Path -LiteralPath $dst)) {
    try {
      & magick "$src" -quality 86 "$dst"
      if ($LASTEXITCODE -ne 0) { $failed++ } else { $converted++ }
    } catch {
      $failed++
    }
  }
}

$changedRefs = 0
foreach ($f in $files) {
  $content = Get-Content -Raw -LiteralPath $f.FullName
  $new = $lineRx.Replace($content, {
    param($m)
    $base = $m.Groups['path'].Value
    $ext = $m.Groups['ext'].Value
    $fullPath = "$base.$ext"
    $tail = $m.Groups['tail'].Value
    $q = $m.Groups['q'].Value
    $q2 = $m.Groups['q2'].Value
    $abs2 = $null

    if ($fullPath -match '^https?://') {
      if ($fullPath.StartsWith($sitePrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
        $rel2 = $fullPath.Substring($sitePrefix.Length) -replace '/', '\\'
        $rel2 = [System.Uri]::UnescapeDataString($rel2)
        $abs2 = Join-Path $root $rel2
      } else {
        return $m.Value
      }
    } else {
      $rel2 = $fullPath -replace '/', '\\'
      $abs2 = [IO.Path]::GetFullPath((Join-Path $f.DirectoryName $rel2))
    }

    if ($abs2 -and (Test-Path -LiteralPath $abs2)) {
      $webpAbs = [IO.Path]::ChangeExtension($abs2, 'webp')
      if (Test-Path -LiteralPath $webpAbs) {
        $changedRefs++
        return "$q$base.webp$tail$q2"
      }
    }

    return $m.Value
  })

  if ($new -ne $content) {
    Set-Content -LiteralPath $f.FullName -Value $new -Encoding utf8
  }
}

"MatchedRefs=$($refs.Count)"
"ReferencedLocalImages=$($targets.Count)"
"ConvertedImages=$converted"
"FailedConversions=$failed"
"UpdatedRefs=$changedRefs"
