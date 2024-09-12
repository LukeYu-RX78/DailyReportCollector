import { StyleSheet, Text, FlatList, View, TextInput, Pressable, Button, Alert } from 'react-native';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack'; 
import { createDrawerNavigator } from '@react-navigation/drawer';
import React, { useState, useEffect, useMemo, Component } from 'react';
import DropDownPicker from "react-native-dropdown-picker";
import RadioGroup from "react-native-radio-buttons-group";

const initDB = async(db) => {
    try {
        await db.execAsync(`
            PRAGMA journal_mode = WAL;
            CREATE TABLE IF NOT EXISTS account (
              uid INTEGER PRIMARY KEY AUTOINCREMENT,
              emailaddress TEXT UNIQUE,
              username TEXT,
              password TEXT,
              authoritylevel INTEGER
             );
            CREATE TABLE IF NOT EXISTS drill_report (
              rid INTEGER PRIMARY KEY AUTOINCREMENT,
              refid TEXT,
              contractno TEXT,
              client TEXT,
              rigid TEXT,
              department TEXT,
              dr_date TEXT,
              dr_shift TEXT,
              dr_day TEXT,
              dr_daytype TEXT,
              machinehrsfrom TEXT,
              machinehrsto TEXT,
              dr_location TEXT,
              comments TEXT,
              reportstate INTEGER
            );
        `);
        console.log('Database initialized !');
    } catch (error) {
        console.log('Error while initializing the database : ', error);
    }
};

const AzureDBComm = async (sql) => {
  fetch('https://samplevisualdemocorewebapi-fwf5ezc9akacfhg5.eastus-01.azurewebsites.net/api/SampleVisual/ExecuteSql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: sql,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.Message) {
        console.log(data.Message);
        return data.Message;
      } else {
        console.log(data);
        return data;
      }
    })
    .catch((error) => {
      console.error('Error:', error);
      return error;
    });
};

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

export default function App() {
  return (
    <SQLiteProvider databaseName='report.db' onInit={initDB}>
        <NavigationContainer>
            <Drawer.Navigator initialRouteName='Login'>
                <Drawer.Screen name='Login' component={LoginScreen}/>
                <Drawer.Screen name='Register' component={RegisterScreen}/>
                <Drawer.Screen name='Home' component={HomeScreen}/>
                <Drawer.Screen name = 'Local Reports' component={LocalReportsScreen}/>
                <Drawer.Screen name = 'All Reports' component={AzureReportsScreen}/>
                <Drawer.Screen name = 'New Report' component={NewReportScreen}/>
            </Drawer.Navigator>
        </NavigationContainer>
    </SQLiteProvider>
  );
}

const LoginScreen = ({navigation}) => {
    const db = useSQLiteContext();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async() => {
        if(email.length === 0 || password.length === 0) {
            Alert.alert('Attention','Please enter email and password');
            return;
        }
        try {
            const user = await db.getFirstAsync('SELECT * FROM account WHERE emailaddress = ?', [email]);
            if (!user) {
                Alert.alert('Error', 'Account does not exist !');
                return;
            }
            const validUser = await db.getFirstAsync('SELECT * FROM account WHERE emailaddress = ? AND password = ?', [email, password]);
            if(validUser) {
                console.log(validUser);
                console.log('username: ', validUser.username);
                Alert.alert('Success', 'Login successful');
                navigation.navigate('Home', {user: validUser.username});
                setEmail('');
                setPassword('');
            } else {
                Alert.alert('Error', 'Incorrect password');
            }
        } catch (error) {
            console.log('Error during login : ', error);
        }
    }
    
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            <TextInput 
                style={styles.input}
                placeholder='Email'
                value={email}
                onChangeText={setEmail}
            />
            <TextInput 
                style={styles.input}
                placeholder='Password'
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />
            <Pressable style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText} >Login</Text>
            </Pressable>
            <Pressable style={styles.link} onPress={() => navigation.navigate('Register')}>
                <Text style={styles.linkText}>Don't have an account? Register</Text>
            </Pressable>
        </View>
    )
}


const RegisterScreen = ({navigation}) => {

    const db = useSQLiteContext();
    const [email, setEmail] = useState('');
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [authority, setAuthority] = useState(0);

    const handleRegister = async() => {
        if  (email.length === 0 || userName.length === 0 || password.length === 0 || confirmPassword.length === 0) {
            Alert.alert('Attention!', 'Please enter all the fields.');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Password do not match');
            return;
        }

        try {
            const existingUser = await db.getFirstAsync('SELECT * FROM account WHERE emailaddress = ?', [email]);
            if (existingUser) {
                Alert.alert('Error', 'Email already been used.');
                return;
            }

            AzureDBComm(`"INSERT INTO demo_account (emailaddress, username, password, authoritylevel) VALUES ('${email}', '${userName}', '${password}', 0);"`);

            await db.runAsync('INSERT INTO account (emailaddress, username, password, authoritylevel) VALUES (?, ?, ?, ?)', [email, userName, password, authority]);
            Alert.alert('Success', 'Registration successful!');
            navigation.navigate('Home', {user : userName});
        } catch (error) {
            console.log('Error during registration : ', error);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Register</Text>
            <TextInput 
                style={styles.input}
                placeholder='Email Address'
                value={email}
                onChangeText={setEmail}
            />
            <TextInput 
                style={styles.input}
                placeholder='Username'
                value={userName}
                onChangeText={setUserName}
            />
            <TextInput 
                style={styles.input}
                placeholder='Password'
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />
            <TextInput 
                style={styles.input}
                placeholder='Confirm password'
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
            />
            <Pressable style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText} >Register</Text>
            </Pressable>
            <Pressable style={styles.link} onPress={() => navigation.navigate('Login')}>
                <Text style={styles.linkText}>Already have an account? Login</Text>
            </Pressable>
        </View>
    )
}


const HomeScreen = ({navigation, route}) => {

    const { user } = route?.params? route.params : 'Guest';
    const currentUser = user ? user : 'Guest';
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Home</Text>
            <Text style={styles.userText}>Welcome {currentUser} !</Text>
            <Pressable style={styles.button} onPress={() => navigation.navigate('Login')}>
                <Text style={styles.buttonText} >Logout</Text>
            </Pressable>
        </View>
    )
}


const AzureReportsScreen = ({navigation}) => {
  const [data, setData] = useState([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://samplevisualdemocorewebapi-fwf5ezc9akacfhg5.eastus-01.azurewebsites.net/api/SampleVisual/ExecuteSql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: '"Select * from demo_drill_report;"',
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const json = await response.json();
        setData(json);
      } catch (error) {
        setData([]);
      }
    };

    fetchData();
  }, []);

  const handleButtonClick = async () => {
    fetch('https://samplevisualdemocorewebapi-fwf5ezc9akacfhg5.eastus-01.azurewebsites.net/api/SampleVisual/ExecuteSql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: inputValue,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.Message) {
          console.log(data.Message);
        } else {
          console.log(data);
          setData(data);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.rigid}</Text>
      <Text style={styles.cell}>{item.dr_shift}</Text>
      <Text style={styles.cell}>{item.department}</Text>
      <Text style={styles.cell}>{item.machinehrsfrom}</Text>
      <Text style={styles.cell}>{item.machinehrsto}</Text>
    </View>
  );

  return (
    <View style={styles.reportContainer}>
      <View style={styles.headerTopBar}>
        <Text style={styles.headerTopBarText}>Cloud Base Daily Drill Report</Text>
      </View>
      <View style={styles.header}>
        <Text style={styles.heading}>RigNo</Text>
        <Text style={styles.heading}>Shift</Text>
        <Text style={styles.heading}>Dept</Text>
        <Text style={styles.heading}>mFrom</Text>
        <Text style={styles.heading}>mTo</Text>
      </View>
      <FlatList
        data={data}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
      />
      <TextInput
        placeholder="    Enter SQL query."
        value={inputValue}
        onChangeText={setInputValue}
        style={styles.InputBox}
      />
      <Button title="Execute" onPress={handleButtonClick} />
    </View>
  );
}

const LocalReportsScreen = ({navigation}) => {
    const db = useSQLiteContext();

    const [data, setData] = useState([]);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
      const fetchReport =  async() => {
        try {
            const report = await db.getAllAsync('SELECT * FROM drill_report;');
            if (!report) {
                console.log('Error, Reports does not exist !');
                return;
            } else {
              setData(report);
            }
        } catch (error) {
            console.log('Error during fetch local reports : ', error);
        }
    }

    fetchReport();
    }, []);

    const handleButtonClick = () => {
      const ridToFind = parseInt(inputValue);
      const foundReport = data.find((item) => item.rid === ridToFind);
      if (foundReport) {
  
        const sql = `"INSERT INTO demo_drill_report (refid, contractno, client, rigid, department, dr_date, dr_shift,
        dr_day, dr_daytype, machinehrsfrom, machinehrsto, dr_location, comments) VALUES 
        ('${foundReport.refid}', '${foundReport.contractno}', '${foundReport.client}', '${foundReport.rigid}', '${foundReport.department}', 
        '${foundReport.dr_date}', '${foundReport.dr_shift}', '${foundReport.dr_day}', '${foundReport.dr_daytype}', '${foundReport.machinehrsfrom}', 
        '${foundReport.machinehrsto}', '${foundReport.dr_location}', '${foundReport.comments}');"`;

       console.log(sql);
       
       const response = AzureDBComm(sql);
       Alert.alert('Upload', 'successful!');

      } else {
        Alert.alert('Error', `No report found with RID: ${inputValue}`);
      }
    };
  
    const renderItem = ({ item }) => (
      <View style={styles.row}>
        <Text style={styles.cell}>{item.rid}</Text>
        <Text style={styles.cell}>{item.rigid}</Text>
        <Text style={styles.cell}>{item.dr_shift}</Text>
        <Text style={styles.cell}>{item.machinehrsfrom}</Text>
        <Text style={styles.cell}>{item.machinehrsto}</Text>
      </View>
    );
  
    return (
      <View style={styles.reportContainer}>
        <View style={styles.headerTopBar}>
          <Text style={styles.headerTopBarText}>Local Daily Drill Report</Text>
        </View>
        <View style={styles.header}>
          <Text style={styles.heading}>RID</Text>
          <Text style={styles.heading}>RigNo</Text>
          <Text style={styles.heading}>Shift</Text>
          <Text style={styles.heading}>mFrom</Text>
          <Text style={styles.heading}>mTo</Text>
        </View>
        <FlatList
          data={data}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
        />
        <TextInput
          placeholder="    Enter the RID that you want to upload."
          value={inputValue}
          onChangeText={setInputValue}
          style={styles.InputBox}
        />
        <Button title="Upload Data" onPress={handleButtonClick} />
      </View>
    );
}


const NewReportScreen = ({navigation}) => {
    const db = useSQLiteContext();
    const currentDate = new Date();

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const client = 'MMG Rosebery';
    const contractno = 'CW2262484_2024';
    const date = `${currentDate.getFullYear()}/${currentDate.getMonth() + 1}/${currentDate.getDate()}`;
    const day = daysOfWeek[currentDate.getDay()];
    const reportstate = -1;

    const [rigid, setRigid] = useState('');
    const [department, setDepartment] = useState('');
    const [shift, setShift] = useState('Day');
    const [daytype, setDaytype] = useState('');
    const [machinehrsfrom, setMachinehrsfrom] = useState('');
    const [machinehrsto, setMachinehrsto] = useState('');
    const [location, setLocation] = useState('');
    const [comments, setComments] = useState('');

    const [isRigNoOpen, setIsRigNoOpen] = useState(false);
    const [isDepOpen, setIsDepOpen] = useState(false);
    const [isDayTypeOpen, setIsDayTypeOpen] = useState(false);

    const dayTypeItems = [
        {label: 'A', value: 'A'},
        {label: 'B', value: 'B'},
        {label: 'C', value: 'C'},
    ];

    const departmentItems = [
        {label: 'AR', value: 'AR'},
        {label: 'DE', value: 'DE'},
        {label: 'DEL', value: 'DEL'},
        {label: 'EXP', value: 'EXP'},
        {label: 'GC', value: 'GC'},
        {label: 'GT', value: 'GT'},
        {label: 'M', value: 'M'},
        {label: 'MX', value: 'MX'},
        {label: 'RD', value: 'RD'},
    ];

    const RigNoItems = [
        {label: 'TLUR01', value: 'TLUR01'},
        {label: 'TLUR02', value: 'TLUR02'},
        {label: 'TLUR03', value: 'TLUR03'},
        {label: 'TLUR09', value: 'TLUR09'},
        {label: 'TLUR11', value: 'TLUR11'},
    ];

    const radioButtons = useMemo(() => ([
        { id: 'Day', label: 'Day', value: 'Day'},
        { id: 'Night', label: 'Night', value: 'Night'}
    ]), []);

    const handleSave = async () => {
        const refid = `${currentDate.getFullYear()}${String(currentDate.getMonth() + 1).padStart(2, '0')}${String(currentDate.getDate()).padStart(2, '0')}_${shift}_${rigid}`;

        console.log('Submit content:');
        console.log('Submit:',`refid: ${refid}; client: ${client}; contractno: ${contractno}; 
        rigno: ${rigid}; department: ${department}; date: ${date}; shift: ${shift};
        day: ${day}; daytype: ${daytype}; machinehrsfrom: ${machinehrsfrom}; machinehrsto: ${machinehrsto};
        location: ${location}; comments: ${comments}; reportsate: ${reportstate}`);

        try {
            await db.runAsync('INSERT INTO drill_report (refid, contractno, client, rigid, department, dr_date, dr_shift, dr_day, dr_daytype, machinehrsfrom, machinehrsto, dr_location, comments, reportstate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [refid, contractno, client, rigid, department, date, shift, day, daytype, machinehrsfrom, machinehrsto, location, comments, reportstate]);
            Alert.alert('Success', 'Store report successful!');
        } catch (error) {
            console.log('Error during registration : ', error);
        }
    }

    const handleSubmit = () => {
        const refid = `${currentDate.getFullYear()}${String(currentDate.getMonth() + 1).padStart(2, '0')}${String(currentDate.getDate()).padStart(2, '0')}_${shift}_${rigid}`;

        const sql = `"INSERT INTO demo_drill_report (refid, contractno, client, rigid, department, dr_date, dr_shift,
         dr_day, dr_daytype, machinehrsfrom, machinehrsto, dr_location, comments) VALUES 
         ('${refid}', '${contractno}', '${client}', '${rigid}', '${department}', '${date}', '${shift}', '${day}', 
        '${daytype}', '${machinehrsfrom}', '${machinehrsto}', '${location}', '${comments}');"`;

        console.log(sql);
        
        const response = AzureDBComm(sql);
        Alert.alert('Submit', 'successful!');
        
    }

    return (
    <View style = {styles.container}>
      <Text style = {styles.title}>
        Create New Report
      </Text>
        <View style={[styles.dropdownContainer, { zIndex: 10 }]}>
            <DropDownPicker
                style={styles.picker}
                items={RigNoItems}
                placeholder='Rig No'
                open={isRigNoOpen}
                setOpen={()=>setIsRigNoOpen(!isRigNoOpen)}
                value={rigid}
                setValue={(val)=>setRigid(val)}
            />
        </View>
        <View style={[styles.dropdownContainer, { zIndex: 9 }]}>
            <DropDownPicker
                style={styles.picker}
                items={departmentItems}
                placeholder='Department'
                open={isDepOpen}
                setOpen={()=>setIsDepOpen(!isDepOpen)}
                value={department}
                setValue={(val)=>setDepartment(val)}
            />
        </View>
        <View style={styles.radioGroupContainer}>
            <Text style={{marginTop: 7}}> Shift: </Text>
            <RadioGroup layout={"row"}  radioButtons={radioButtons} onPress={setShift} selectedId={shift}/>
        </View>
        <View style={[styles.dropdownContainer, { zIndex: 8 }]}>
            <DropDownPicker
                style={styles.picker}
                items={dayTypeItems}
                placeholder='Day Type'
                open={isDayTypeOpen}
                setOpen={()=>setIsDayTypeOpen(!isDayTypeOpen)}
                value={daytype}
                setValue={(val)=>setDaytype(val)}
            />
        </View>
        <TextInput
            style={styles.input}
            placeholder='Machine Hrs From'
            value={machinehrsfrom}
            onChangeText={setMachinehrsfrom}
        />
        <TextInput
            style={styles.input}
            placeholder='Machine Hrs To'
            value={machinehrsto}
            onChangeText={setMachinehrsto}
        />
        <TextInput
            style={styles.input}
            placeholder='Location'
            value={location}
            onChangeText={setLocation}
        />
        <TextInput
            style={styles.input}
            placeholder='Comments'
            value={comments}
            onChangeText={setComments}
        />
        <Pressable style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText} >Submit to cloud base</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText} >Save in local</Text>
        </Pressable>
    </View>

  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownContainer: {
    width: '80%',
  },
  radioGroupContainer: {
      flexDirection: 'row',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  input: {
    width: '80%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    marginVertical: 5,
  },
  picker: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#000',
    marginVertical: 5,
  },
  button: {
    backgroundColor: 'blue',
    padding: 10,
    marginVertical: 10,
    width: '80%',
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
  },
  link : {
    marginTop: 10,
  },
  linkText: {
    color: 'blue',
  },
  userText: {
    fontSize: 18,
    marginBottom: 30,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  reportContainer: {
    flex: 1,
    paddingVertical: 30,
    paddingHorizontal: 30,
  },
  headerTopBar: {
    backgroundColor: '#4F4F4F',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 5,
    elevation: 2,
  },
  headerTopBarText: {
    color: '#FFF',
    fontSize: 16,
  },
  header: {
    backgroundColor: "#9F9F9F",
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  heading: {
    flex: 1,
    fontSize: 14,
    color: '#000',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
    marginHorizontal: 2,
    elevation: 1,
    borderRadius: 3,
    borderColor: '#FFF',
    padding: 10,
    backgroundColor: '#FFF',
  },
  cell: {
    fontSize: 14,
    textAlign: 'left',
    flex: 1,
  },
  InputBox: {
    height: 40,
    borderColor: '#4F4F4F',
    borderWidth: 1,
    marginBottom: 10,
    backgroundColor: '#FFF',
  }
});