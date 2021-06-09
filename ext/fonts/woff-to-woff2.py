#!/usr/bin/python3
#
# On Windows or a current Linux distro.
# pip3 install fontTools[woff]
#
import os
from fontTools.ttLib import TTFont

directory = '.'

for name in os.listdir(directory):
    file = os.path.join(directory, name)
    if os.path.isfile(file) and name.endswith(".woff"):
        (b, ext) = os.path.splitext(name)
        woff2 = b+".woff2"
        w2 = os.path.join(directory, woff2)
        if os.path.isfile(w2):
            continue
        print(file, "=>", w2)
        f = TTFont(file)
        f.flavor = "woff2"
        f.save(woff2)
