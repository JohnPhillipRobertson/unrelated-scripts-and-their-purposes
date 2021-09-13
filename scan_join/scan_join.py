#!/bin/bash
import glob
import os
import shutil
import subprocess
import sys

if os.path.isdir("/Volumes/EMTEC C450/HPSCANS"):
    try:
        clarg = sys.argv[1]
        tilde_desk_temp = os.path.join(os.path.expanduser('~'), "Desktop/temp")
        if not os.path.exists(tilde_desk_temp):
            os.makedirs(tilde_desk_temp)
        for i in os.listdir("/Volumes/EMTEC C450/HPSCANS"):
            if i.startswith("._"):
                continue
            shutil.move(os.path.join("/Volumes/EMTEC C450/HPSCANS", i), tilde_desk_temp)
        rm_pdf = glob.glob("/Volumes/EMTEC C450/HPSCANS/*.pdf")
        for i in rm_pdf:
            os.remove(f)
            
        l = os.listdir(tilde_desk_temp)
        l.sort()
        l = [tilde_desk_temp + "/" + i for i in l]
        subprocess.call(["/System/Library/Automator/Combine PDF Pages.action/Contents/Resources/join.py", "-v", "-o", tilde_desk_temp + "/../%s.pdf" % clarg, tilde_desk_temp] + l)
        
        rm_pdf_two = glob.glob(tilde_desk_temp + "/*.pdf")
        for i in rm_pdf_two:
            os.remove(i)
        os.rmdir(tilde_desk_temp)
        print("Now check the desktop for the file you just made.")
    except IndexError:
        print("A name for the file must be written after the name of this command.")
else:
    print("The USB drive must be plugged in.")
   
#Original bash script that wouldn't work
"""
#!/bin/bash
if [ -d "/Volumes/EMTEC C450/HPSCANS" ]; then #Only if the USB drive is plugged in
  if [ "$#" -eq 1 ]; then #Only if there is a name given after (a "command line argument")
    mv  "/Volumes/EMTEC C450/HPSCANS/*" ~/Desktop/temp #Move everything in the drive to the temporary folder
    rm "/Volumes/EMTEC C450/HPSCANS/*.pdf" #Then delete it
    "/System/Library/Automator/Combine PDF Pages.action/Contents/Resources/join.py" -o ~/Desktop/temp/"$1".pdf ~/Desktop/temp/scan*.pdf #Join the contents of that file together
    mv ~/Desktop/temp/"$1".pdf ~/Desktop #Move that file to desktop
    rm ~/Desktop/temp/*.pdf #Remove everything else in the temporary folder
  else
    echo "A name for the file must be written after the name of this command." #Read the next comment; it's like that but for if you didn't include a name.
  fi
else
  echo "The USB drive must be plugged in." #This only displays if the USB drive wasn't plugged in, which is why it's under "else."
fi
"""
