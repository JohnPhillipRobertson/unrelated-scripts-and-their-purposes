#!/bin/bash

sed 's/\(.*\),/\1 -/' 60s_popular.txt | sed 's/.*- \(.*\)/\1/' | sed '/^$/d' > intermed;

#python3 instance_count.py; #would have done the same thing as the next line
sort intermed | uniq -c | sort -r > most_popular.txt
#Look at how much simple that is than the Python script!

rm intermed;