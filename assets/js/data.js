/* Sample data shared by the demos (made up: names, salaries and e-mails are not real). */
(function () {
  "use strict";
  var first = ["Aarav", "Asha", "Kiran", "Priya", "Ravi", "Meera", "Arjun", "Ananya", "Vikram", "Sana", "Ishaan", "Divya", "Neel", "Kavya", "Rahul", "Nisha"];
  var last = ["Rao", "Sharma", "Reddy", "Patel", "Kumar", "Das", "Iyer", "Singh", "Nair", "Verma", "Gupta", "Joshi"];
  var departments = ["Engineering", "Quality Assurance", "Accessibility", "Data", "Product", "Support", "Security", "Design"];
  var roles = ["Developer", "Senior Developer", "QA Engineer", "Technical Lead", "Analyst", "Designer", "Support Engineer", "Product Owner"];
  var cities = ["Hyderabad", "Bengaluru", "Chennai", "Pune", "Remote"];
  var statuses = ["Active", "Active", "Active", "On leave", "Contractor"];
  var start = new Date("2021-01-04").getTime();
  var DAY = 86400000;

  /* n staff rows; row 78 has an unusual salary for the anomaly finder */
  function staff(n) {
    var rows = new Array(n);
    for (var i = 0; i < n; i++) {
      var f = first[i % first.length], l = last[(i * 7) % last.length];
      rows[i] = {
        id: 1001 + i,
        name: f + " " + l,
        email: (f + "." + l + (i + 1) + "@example.test").toLowerCase(),
        department: departments[(i * 3) % departments.length],
        role: roles[(i * 5) % roles.length],
        city: cities[(i * 3) % cities.length],
        salary: i === 77 ? 520000 : 45000 + ((i * 1379) % 155000),
        joined: new Date(start + ((i * DAY * 7) % (DAY * 1900))).toISOString().slice(0, 10),
        status: statuses[(i * 2) % statuses.length]
      };
    }
    return rows;
  }

  function inr(n) { return "₹" + Number(n).toLocaleString("en-IN"); }

  var staffColumns = [
    { key: "id", label: "ID", type: "number", align: "left" },
    { key: "name", label: "Name" },
    { key: "email", label: "Email", hiddenOnMobile: true },
    { key: "department", label: "Department" },
    { key: "role", label: "Role", hiddenOnMobile: true },
    { key: "city", label: "City" },
    { key: "salary", label: "Salary", type: "number", render: function (v) { return inr(v); } },
    { key: "joined", label: "Joined", type: "date" },
    { key: "status", label: "Status", type: "badge" }
  ];

  /* Telugu: poems from the children's book "రంగురంగుల రత్నదీపాలు" */
  var poems = [{"id":1,"title":"ఆలోచన","page":9,"lines":12,"stanzas":3},{"id":2,"title":"ఎవరమ్మా","page":10,"lines":12,"stanzas":3},{"id":3,"title":"మబ్బులు","page":11,"lines":10,"stanzas":1},{"id":4,"title":"చీకటీ","page":12,"lines":16,"stanzas":4},{"id":5,"title":"చుక్క ఎగిరి వస్తున్నది!","page":13,"lines":12,"stanzas":3},{"id":6,"title":"అన్నీ ఇవి వెన్నెలలా?","page":14,"lines":12,"stanzas":3},{"id":7,"title":"తోట","page":15,"lines":12,"stanzas":3},{"id":8,"title":"ఎగిరె పిట్టలు!","page":16,"lines":12,"stanzas":4},{"id":9,"title":"తొండపాట","page":17,"lines":12,"stanzas":3},{"id":10,"title":"గారడివాడి పాము","page":18,"lines":20,"stanzas":3},{"id":11,"title":"జాలరి పాట","page":20,"lines":12,"stanzas":3},{"id":12,"title":"సాలెవాళ్ళతో","page":21,"lines":12,"stanzas":3},{"id":13,"title":"పాపం! బిచ్చగత్తె!","page":22,"lines":12,"stanzas":3},{"id":14,"title":"పంచరంగులు","page":23,"lines":25,"stanzas":5},{"id":15,"title":"ఎఱ్ఱని పూలచెట్లు","page":24,"lines":17,"stanzas":5},{"id":16,"title":"మఱపురాదు","page":25,"lines":12,"stanzas":3},{"id":17,"title":"నాల్గు దిక్కులు","page":26,"lines":44,"stanzas":11},{"id":18,"title":"అడవీ! కారడవీ!","page":28,"lines":20,"stanzas":6},{"id":19,"title":"ఉగాది","page":30,"lines":16,"stanzas":4},{"id":20,"title":"ఓహో! సముద్రమా!","page":31,"lines":35,"stanzas":7},{"id":21,"title":"ఆనందమంటే!","page":33,"lines":12,"stanzas":3},{"id":22,"title":"నీడలు","page":34,"lines":12,"stanzas":3},{"id":23,"title":"ఏం చేయాలి?","page":35,"lines":10,"stanzas":1},{"id":24,"title":"సూర్యబింబం","page":36,"lines":12,"stanzas":3},{"id":25,"title":"నిన్నా నేడూ రేపూ","page":37,"lines":14,"stanzas":4},{"id":26,"title":"రైలులోంచి","page":38,"lines":16,"stanzas":4},{"id":27,"title":"చివరకు మిగిలింది!","page":39,"lines":24,"stanzas":6}];
  var poemColumns = [
    { key: "id", label: "క్రమ సంఖ్య", type: "number", align: "left" },
    { key: "title", label: "శీర్షిక" },
    { key: "page", label: "పుట", type: "number" },
    { key: "lines", label: "పంక్తులు", type: "number" },
    { key: "stanzas", label: "చరణాలు", type: "number" }
  ];

  window.DocsData = { staff: staff, staffColumns: staffColumns, poems: poems, poemColumns: poemColumns, inr: inr };
})();
