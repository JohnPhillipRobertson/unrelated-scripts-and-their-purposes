/*
An explanation:
All incidents and ritms (incident.list and sc_req_item.list) between a given start and end time are queried, by way of querying task.list, from which those tables extend.
A button on those pages called "Call Out Reporting" (originally Page Out Reporting) was used to generate reports and store them in a field called u_page_out_notes.
Never mind the multiple different index variables when just "i" would have sufficed;
SN's built-in linter warns about duplicate function declarations, even in a loop, and I wanted to remove the warnings so as to get rid of the distraction.
Page Out Notes are separated by "@"s, which the first regex loop splits them up on, and are furthermore split by "/"s, which the next loop handles,
making sure to escape commas which might be in the comment portion of a page out note. By the way, when page out notes are saved, @s and /s are substituted for "at" and "slash"
The commented out block was to sort them by date, as a page out note could contain several reports made on different dates, but the requirement was removed.
*/

var headers = ['Number', 'Count', 'Time', 'Teams paged', 'Contact type', 'Person contacted', 'Phone number', 'Comments'];
var csvData = '';
for (var i = 0; i < headers.length; i++) {
	csvData = csvData + headers[i] + ',';
}
csvData = csvData.slice(0, -1) + '\r\n';

var start = current.variables.starting_from + ' 00:00:00';
var end = current.variables.going_to + ' 23:59:59';
start = new GlideDateTime(start);
end = new GlideDateTime(end);
var gr = new GlideRecord('task'); //It does not matter that task is queried, because Page Out Logging only shows up on sc_req_item.do and incident.do
gr.orderBy('sys_created_on');
gr.addQuery('sys_created_on>=javascript:gs.dateGenerate("' + start + '")^sys_created_on<=javascript:gs.dateGenerate("' + end + '")^u_page_out_notesISNOTEMPTY^u_page_out_notes!=@');
gr.query();
var arr = [];
while (gr.next()) {
	arr.push([gr.number + '', gr.u_page_out_notes + '']);
}

//gs.log('csvData id: ' + arr);

var unsorted_lines = [];
for (var id = 0; id < arr.length; id++) { //Here, arr is divided into its individual page out reports
	if (current.variables.show_last_team_paged_only == 'false') {
		var split = arr[id][1].split('+');
		split.shift();
		for (var j = 0; j < split.length; j++) {
			unsorted_lines.push(arr[id][0] + '/' + split[j].slice(0, -1));
		}
	}
	else {
		var re = arr[id][1].match(/@\+[^@]*@$/);
		if (!re) {
			re = arr[id][1].match(/\+[^@]*@$/);
			unsorted_lines.push(arr[id][0] + '/' + re[0].substring(1).slice(0, -1));
		}
		else {
			unsorted_lines.push(arr[id][0] + '/' + re[0].substring(2).slice(0, -1));
		}
	}
}

//gs.log('csvData ul: ' + unsorted_lines);

var processed_unsorted = [];
for (var idx = 0; idx < unsorted_lines.length; idx++) { //Unsorted_lines is not sorted here, but rather the commas are escaped, and the slashes replaced with unescaped commmas
	var temp_a = unsorted_lines[idx].split('/');
	var temp_s = '';
	for (jx = 0; jx < temp_a.length; jx++) {
		temp_s += '"' + temp_a[jx] + '",';
	}
	processed_unsorted.push(temp_s.slice(0, -1));
}

//gs.log('csvData pu: ' + processed_unsorted);

var time_and_notes = processed_unsorted; /*[];
for (var ind = 0; ind < processed_unsorted.length; ind++) {
	var time = new GlideDateTime(processed_unsorted[ind].match(/\d{4}-\d{2}-\d{2}/)[0]);
	var sub = [time, processed_unsorted[ind]];
	time_and_notes.push(sub);
}

//gs.log('csvData tan: ' + time_and_notes);

time_and_notes.sort((function(index){
	return function(a, b){
		return (a[index] === b[index] ? 0 : (a[index] < b[index] ? -1 : 1));
	};
})(0)); //This sorts time_and_notes by the first element of each array
*/
for (var index = 0; index < time_and_notes.length; index++) { //Now the csv is finally built
	csvData = csvData + time_and_notes[index];//[1];
	csvData = csvData + '\r\n';
}

current.description = 'Page out reporting non-billable case. See the attached report.';
current.short_description = current.description;
current.company = '29f6f85813c212005e7fb168d144b00c';
current.billable = 'false';
current.state = '4';
//gs.log('csvData: ' + csvData);

var grAttachment = new GlideSysAttachment();
grAttachment.write(current, 'page_out_report.csv', 'application/csv', csvData);