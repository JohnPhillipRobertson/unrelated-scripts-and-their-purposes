#/bin/bash
sed -r -e 's/Knowledge /Knowledge\n/g;s/ ([0-9]+\. )/\n\1/g' $1 > cleaned.txt
