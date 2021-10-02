#!/usr/bin/python3
#
# Removes any woff fonts where a smaller woff2 font exists.
#
import os

directory = '.'

for name in os.listdir(directory):
    file = os.path.join(directory, name)
    if os.path.isfile(file) and name.endswith(".woff"):
        (b, ext) = os.path.splitext(name)
        woff2 = b+".woff2"
        w2 = os.path.join(directory, woff2)
        if not os.path.isfile(w2):
            continue
        if os.path.getsize(file) <= os.path.getsize(w2):
            continue
        print(file, "<<", w2)
        os.remove(file)
