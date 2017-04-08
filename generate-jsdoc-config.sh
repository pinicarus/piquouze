#!/bin/sh

echo "{"
echo -e '\t"heading-depth": 1,'
echo -e '\t"files": ['
find ${1} -type d -printf '\t\t"%p/**.js"\n' | paste --serial --delimiters=","
echo -e '\t]'
echo "}"
