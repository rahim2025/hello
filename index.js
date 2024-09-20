const express = require("express");
const mysql = require("mysql2");
const app = express();
const methodOverride = require("method-override");
const path = require("path");
const { error } = require("console");



app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname,"./public/css")));
app.use(express.static(path.join(__dirname,"./public/js")));



const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'ANIMAL_CARE',
    password:"12345"
  });
let port =8080;

app.listen(port,()=>{
    console.log(`App is listing at port: ${port}`);
});

//for admin login
app.get("/login",(req,res) =>{
    res.render("login_page.ejs");
});
app.post("/admin_login",(req,res) =>{
    let {username:entered_username,password:entered_password} = req.body;
    q = "SELECT * FROM admin";

    try{
        connection.query(q,(err,result) =>{
            if(err) throw err;
            let user = result[0];
            // let password = user.password;
            // let username = user.username;
            let password = "12345";
            let username = "arka";
            if(password==entered_password && username == entered_username){
                res.render("home.ejs");

            }
            else{
                res.send("Wrong Password");
            }
        });

    }catch(err){

        res.status(500).send("Error deleting doctor");
    }

});

// all doctor list

app.get("/all_doctor_list",(req,res) =>{
    q="SELECT * FROM doctors";
    try{
        connection.query(q,(err,doctors) =>{
            if(err) throw err;
            res.render("doctor_list.ejs",{doctors});
        });


    }catch(err){
        res.status(500).send("Error deleting doctor");
    }

});

// Edit Information of doctor
app.get("/doctor/:id/edit",(req,res) =>{
    let {id} = req.params;
    let q = `SELECT * FROM doctors WHERE doctor_id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("doctor_info_edit.ejs", { user });
    });
  } catch (err) {
    res.status(500).send("Error deleting doctor");
  }
});

app.patch("/doctor/:id/edit", (req, res) => {
    let { id } = req.params;
    console.log(id);
    let { phone_num:n_phone_num, email:n_email ,charge: n_charge } = req.body;  //n=new

    let q1 = `UPDATE doctors  SET phone_num='${n_phone_num}', email='${n_email}', 
    charge= ${n_charge} WHERE doctor_id='${id}'`;
  
    try {
      connection.query(q1, (err, result) => {
        if (err) throw err;
        res.redirect("/all_doctor_list");
      });


    }catch(err){
        res.status(500).send("Error deleting doctor");
    }

});

//Delete
app.delete("/doctor/:id/", (req, res) => {
    let { id } = req.params;
  
    let q1 = `DELETE FROM doctors WHERE doctor_id='${id}'`;
  
    try {
      connection.query(q1, (err, result) => {
        if (err) throw err;
        res.redirect("/all_doctor_list");
      });
    } catch (err) {
      res.send("Error found");
    }
  });
  

// Add new doctor
app.get("/doctor/add_new_doctor",(req,res) =>{
  res.render("add_new_doctor.ejs");

})

app.post("/doctor/add_new_doctor", (req, res) => {
  let {
      doctor_id,
      name,
      gender,
      phone_num,
      email,
      specialization,
      qualification,
      charge
  } = req.body;

  let q = `INSERT INTO doctors (doctor_id, name, gender, phone_num, email, specialization, qualification, charge) 
           VALUES ('${doctor_id}', '${name}', '${gender}', '${phone_num}', '${email}', '${specialization}', '${qualification}', ${charge})`;

  try {
      connection.query(q, (err, result) => {
          if (err) throw err;

          let employeeQ = `INSERT INTO employees (employee_id, name, emp_type, phone_num, address, date_of_birth, nid, contract) 
                          VALUES ('${doctor_id}', '${name}', 'Doctor', '${phone_num}', '', '', '', '')`;

          connection.query(employeeQ, (err, empResult) => {
              if (err) throw err;

              res.redirect("/all_doctor_list");
          });
      });
  } catch (err) {
      res.send("error found");
  }
});

//PATIENT  START
app.get("/all_patient_list", (req, res) => {
  q = "SELECT * FROM patients";
  try {
      connection.query(q, (err, patients) => {
          if (err) throw err;
          res.render("patient_list.ejs", { patients });
      });
  } catch (err) {
      res.status(500).send("Error fetching patients list");
  }
});

//ADD NEW PATIENT

app.get("/patient/add_new_patient", (req, res) => {
  res.render("add_new_patient.ejs");
});

app.post("/patient/add_new_patient", (req, res) => {
  let { patient_id, name, date_of_birth, gender, phone_num, email, address, history } = req.body;

  let q = `INSERT INTO patients (patient_id, name, date_of_birth, gender, phone_num, email, address, history) 
           VALUES ('${patient_id}', '${name}', '${date_of_birth}' ,'${gender}', '${phone_num}', '${email}', '${address}', '${history}')`;

  try {
      connection.query(q, (err, result) => {
          if (err) throw err;
          res.redirect("/all_patient_list"); 
      });
  } catch (err) {
      res.send("Error occurred while adding a new patient");
  }
});

// EDIT INFORMATION

app.get("/patient/:id/edit", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM patients WHERE patient_id='${id}'`;

  try {
      connection.query(q, (err, result) => {
          if (err) throw err;
          let patient = result[0];
          res.render("patient_info_edit.ejs", { patient });
      });
  } catch (err) {
      res.status(500).send("Error fetching patient data");
  }
});

app.patch("/patient/:id/edit", (req, res) => {
  let { id } = req.params;
  let { phone_num: n_phone_num, email: n_email, date_of_birth:n_date_of_birth, address: n_address, history: n_history } = req.body;

  let q = `UPDATE patients SET phone_num='${n_phone_num}', email='${n_email}', date_of_birth ='${n_date_of_birth}',
           address='${n_address}', history='${n_history}' WHERE patient_id='${id}'`;

  try {
      connection.query(q, (err, result) => {
          if (err) throw err;
          res.redirect("/all_patient_list");
      });
  } catch (err) {
      res.status(500).send("Error updating patient information");
  }
});

//DELETE
app.delete("/patient/:id", (req, res) => {
  let { id } = req.params;
  let q = `DELETE FROM patients WHERE patient_id='${id}'`;

  try {
      connection.query(q, (err, result) => {
          if (err) throw err;
          res.redirect("/all_patient_list");
      });
  } catch (err) {
      res.status(500).send("Error deleting patient");
  }
});


  //-------Appointment---------------------------//
// List all appointments
app.get("/all_appointments", (req, res) => {
    const q = "SELECT * FROM appointment";
    try {
      connection.query(q, (err, appointments) => {
        if (err) throw err;
        res.render("appointment_list.ejs", { appointments });
      });
    } catch (err) {
      res.status(500).send("Error fetching appointments");
    }
  });

// Add new appointment--------------------
app.get("/appointment/add_new_appointment", (req, res) => {
    const patientsQuery = "SELECT * FROM patients";
    const doctorsQuery = "SELECT * FROM doctors";
  
    try {
      connection.query(patientsQuery, (err, patients) => {
        if (err) throw err;
  
        connection.query(doctorsQuery, (err, doctors) => {
          if (err) throw err;
  
          res.render("add_new_appointment.ejs", { patients, doctors });
        });
      });
    } catch (err) {
      res.status(500).send("Error fetching patients and doctors");
    }
  });
  
  app.post("/appointment/add_new_appointment", (req, res) => {
    const { patient_id, doctor_id, date,time, visiting_fee } = req.body;
  
    const q = `INSERT INTO appointment (patient_id, doctor_id, date, time,visiting_fee)
               VALUES ('${patient_id}', '${doctor_id}', '${date}','${time}', ${visiting_fee})`;
  
    try {
      connection.query(q, (err, result) => {
        if (err) throw err;

        let newq= `UPDATE patients
        SET total_cost = total_cost + ${visiting_fee}
        WHERE patient_id = '${patient_id}' `;

        connection.query(newq, (err, result) => {
          if (err) throw err;
        
        
        res.redirect("/all_appointments");
      });
    });
   } catch (err) {
      res.status(500).send("Error occurred while adding a new appointment");
    }
  });



///lab_test /


app.get('/lab_tests/home', (req, res) => {
  res.render('lab_tests_home.ejs');
});

app.get('/admit_into_room', (req, res) => {
  res.render('admit_into_room.ejs');
});

//-- all lab test
app.get("/all/lab_tests", (req, res) => {
  q = "SELECT * FROM lab_tests";
  try {
      connection.query(q, (err, labTests) => {
          if (err) throw err;
          res.render("lab_test_list.ejs", { labTests });
      });
  } catch (err) {
      res.status(500).send("Error fetching lab tests");
  }
});

//Edit
app.get("/lab_test/:id/edit", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM lab_tests WHERE test_id='${id}'`;

  try {
      connection.query(q, (err, result) => {
          if (err) throw err;
          let test = result[0];
          res.render("lab_test_info_edit.ejs", { test });
      });
  } catch (err) {
      res.status(500).send("Error editing lab test");
  }
});

//update
app.patch("/lab_test/:id/edit", (req, res) => {
  let { id } = req.params;
  let { test_name, cost, description } = req.body;

  let q1 = `UPDATE lab_tests SET test_name='${test_name}', cost=${cost}, description='${description}' WHERE test_id='${id}'`;

  try {
      connection.query(q1, (err, result) => {
          if (err) throw err;
          res.redirect("/all_lab_tests");
      });
  } catch (err) {
      res.status(500).send("Error updating lab test");
  }
});

//delete
app.delete("/lab_test/:id/", (req, res) => {
  let { id } = req.params;

  let q1 = `DELETE FROM lab_tests WHERE test_id='${id}'`;

  try {
      connection.query(q1, (err, result) => {
          if (err) throw err;
          res.redirect("/all_lab_tests");
      });
  } catch (err) {
      res.status(500).send("Error deleting lab test");
  }
});

//insert
app.get("/lab_test/add_new_test", (req, res) => {
  res.render("add_new_lab_test.ejs");
});

app.post("/lab_test/add_new_test", (req, res) => {
  let { test_id, patient_id, test_name, cost, description } = req.body;

  let q = `INSERT INTO lab_tests (test_id, patient_id, test_name, cost, description) VALUES ('${test_id}', '${patient_id}', '${test_name}', ${cost}, '${description}')`;

  try {
      connection.query(q, (err, result) => {
          if (err) throw err;
          let newq= `UPDATE patients
          SET total_cost = total_cost + ${cost}
          WHERE patient_id = '${patient_id}' `;

          connection.query(newq, (err, result) => {
            if (err) throw err;


          res.redirect("/all/lab_tests");
      });
      });
  } catch (err) {
      res.status(500).send("Error adding new lab test");
  }
});

app.all("*",(req,res,next) =>{
  res.send("404 NOT FOUND");
});

