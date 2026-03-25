@echo off
set SRC=C:\Users\SrinI\.gemini\antigravity\brain\96e5ed00-063d-4b4a-ad1b-aead9e2f30cf
set DEST=c:\Users\SrinI\OneDrive\Desktop\PROJECT\backend\uploads

if not exist "%DEST%" mkdir "%DEST%"

copy /Y "%SRC%\vibrant_anarkali_boutique_1774435636570.png" "%DEST%\vibrant_anarkali.png"
copy /Y "%SRC%\electric_blue_boutique_lehanga_1774435653032.png" "%DEST%\electric_blue_lehanga.png"
copy /Y "%SRC%\neon_pink_designer_kurti_1774435594912.png" "%DEST%\neon_pink_kurti.png"
copy /Y "%SRC%\emerald_green_gown_vibrant_1774435611766.png" "%DEST%\emerald_gown.png"
copy /Y "%SRC%\lavender_sharara_set_1774436472968.png" "%DEST%\lavender_sharara.png"
copy /Y "%SRC%\maroon_velvet_ensemble_1774436487911.png" "%DEST%\maroon_velvet.png"
copy /Y "%SRC%\pastel_mint_dhoti_style_1774436503706.png" "%DEST%\pastel_mint.png"
copy /Y "%SRC%\gold_embroidered_suit_1774436519398.png" "%DEST%\gold_suit.png"

echo.
dir "%DEST%\*.png"
