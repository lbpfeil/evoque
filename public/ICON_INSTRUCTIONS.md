# Instruções para Criar os Ícones PWA

Os ícones necessários são:
1. **favicon.ico** (32x32)
2. **apple-touch-icon.png** (180x180)
3. **pwa-192x192.png** (192x192)
4. **pwa-512x512.png** (512x512)

## Opção 1: Usar ferramenta online (Recomendado)
Acesse: https://realfavicongenerator.net/
- Faça upload do `icon.svg`
- Baixe todos os ícones gerados
- Coloque-os na pasta `public/`

## Opção 2: Usar ImageMagick (se instalado)
```bash
# Converter SVG para PNG
convert icon.svg -resize 192x192 pwa-192x192.png
convert icon.svg -resize 512x512 pwa-512x512.png
convert icon.svg -resize 180x180 apple-touch-icon.png
convert icon.svg -resize 32x32 favicon.ico
```

## Opção 3: Usar PWA Asset Generator
```bash
npx pwa-asset-generator icon.svg public/ --background "#ffffff"
```

## Design do Ícone
- Fundo branco (#FFFFFF)
- Livro preto com bookmark
- Linhas representando texto destacado
