#!/usr/bin/python
f = open("intermed", "r")
str = f.read().rstrip('\n')
f.close()
l = str.split('\n')
counts = dict()
for i in l:
    counts[i] = counts.get(i, 0) + 1
counts = dict(sorted(counts.items(), key=lambda item: item[1], reverse=True))
str = ""
for k in counts:
    str += f"{k}: {counts[k]}\n"
f = open("most_popular.txt", "w")
f.write(str)
f.close()