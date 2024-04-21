#!/bin/bash

# File to upload
file_path=''

# Credentials
GAMIL=''
PWSS=''

# API Keys
Pixeldrain=''
Mixdrop=''



# Upload to Gofile
cd All
gofile_url=$(./main gofile -f "$file_path" | grep -o 'https://gofile.io/[^ ]*')

# Upload to Mega
cd ../Mega
mega_url=$(ruby rmega-up.rb "$file_path" -u ${GAMIL} --get-link --pass ${PWSS} | grep -o 'https://mega.nz/[^ ]*')

# Upload to Pixeldrain
cd ../Pixeldrain
pixeldrain_url=$(./main upload -k ${Pixeldrain} -v "$file_path" | grep -o 'https://pixeldrain.com/[^ ]*')


# Upload to MediaFire
cd ../MediaFire
mediafire_url=$(python mfcmd.py -e ${GAMIL} -p ${PWSS} -f "$file_path" | grep 'https://www.mediafire.com/file/')

# Upload to Mixdrop
cd ../Mixdrop
mixdrop_url=$(python main.py -e "$GAMIL" -k "$Mixdrop" -f "$file_path")



# Extract links from output
gofile_link=$(echo "$gofile_url" | awk -F 'd/' '{print $2}')
mega_link=$(echo "$mega_url" | awk -F 'file/' '{print $2}')
pixeldrain_link=$(echo "$pixeldrain_url" | awk -F 'u/' '{print $2}')
mediafire_link=$(echo "$mediafire_url" | awk -F 'file/' '{print $2}' | awk -F '/' '{print $1}')
mixdrop_link=$(echo "$mixdrop_url" | grep -o 'https://mixdrop\.[a-zA-Z]\{2,3\}/[^ ]*')

# HTML snippet
html_snippet="<div class=\"Download\">
<b>DOWNLOAD</b>
<br>
Windows: <a href=\"https://gofile.io/d/$gofile_link\" class=\"link\" ><span class=\"link-color\">Gofile.io</span></a> | <a href=\"https://mega.nz/file/$mega_link\" class=\"link\" ><span class=\"link-color\">Mega</span></a> | <a href=\"$pixeldrain_url\" class=\"link\" ><span class=\"link-color\">Pixeldrain</span></a> | <a href=\"https://www.mediafire.com/file/$mediafire_link\" class=\"link\" ><span class=\"link-color\">MediaFire</span></a> | <a href=\"$mixdrop_link\" class=\"link\" ><span class=\"link-color\">Mixdrop</span></a>
</div>"
echo "----------"
echo "=---------"
echo "==--------"
echo "===-------"
echo "====------"
echo "=====-----"
echo "======----"
echo "=======---"
echo "========--"
echo "=========-"
echo "=========="
clear
# Print HTML snippet
echo "$html_snippet"
