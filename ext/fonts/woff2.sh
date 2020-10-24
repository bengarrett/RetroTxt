#!/usr/bin/env bash

for d in *.woff ; do
    echo "$d"
    woff2_compress "$d"
done