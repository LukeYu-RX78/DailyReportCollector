import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, FlatList, View, TextInput, Pressable, Button, Alert } from 'react-native';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack'; 
import { createDrawerNavigator } from '@react-navigation/drawer';
import React, { useState, useEffect, Component } from 'react';


//initialize the database
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
              refid INTEGER,
              contractno TEXT,
              client TEXT,
              rigid TEXT,
              department TEXT,
              date TEXT,
              shift TEXT,
              day TEXT,
              daytype TEXT,
              machinehrsfrom REAL,
              machinehrsto REAL,
              location TEXT,
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
                <Drawer.Screen name = 'All Reports' component={AzureReportsScreen}/>
                <Drawer.Screen name = 'ReportFroms' component={FormsScreen}/>
                <Drawer.Screen name = 'NewReport' component={NewReportScreen}/>
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
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Home</Text>
            <Text style={styles.userText}>Welcome {user} !</Text>
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
        const response = await fetch('https://samplevisualdemocorewebapi-fwf5ezc9akacfhg5.eastus-01.azurewebsites.net/api/SampleVisual/GetStagingSamples', {
          method: 'GET',
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
      <Text style={styles.cell}>{item.SampleID}</Text>
      <Text style={styles.cell}>{item.HoleID}</Text>
      <Text style={styles.cell}>{item.mTo}</Text>
      <Text style={styles.cell}>{item.mFrom}</Text>
      <Text>Edit</Text>
    </View>
  );

  const keyExtractor = (item) => item.SampleID;

  return (
    <View style={styles.reportContainer}>
      <View style={styles.headerTopBar}>
        <Text style={styles.headerTopBarText}>StagingRCSamples</Text>
      </View>
      <View style={styles.header}>
        <Text style={styles.heading}>SampleID</Text>
        <Text style={styles.heading}>HoleID</Text>
        <Text style={styles.heading}>mFrom</Text>
        <Text style={styles.heading}>mTo</Text>
        <Text style={styles.heading}>Action</Text>
      </View>
      <FlatList
        data={data}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
      />
      <TextInput
        placeholder="Enter SQL query."
        value={inputValue}
        onChangeText={setInputValue}
        style={styles.InputBox}
      />
      <Button title="Execute" onPress={handleButtonClick} />
    </View>
  );
}

const FormsScreen = ({navigation}) => {
  return (
    <View style = {styles.container}>
      <Text style = {styles.title}>
        View Report Forms
      </Text>
    </View>
  )
}

const NewReportScreen = ({navigation}) => {
  return (
    <View style = {styles.container}>
      <Text style = {styles.title}>
        Create New Report
      </Text>
    </View>
  )
}

const EditFormScreen = ({navigation}) => {
  return (
    <View style = {styles.container}>
      <Text style = {styles.title}>
        Edit From Data
      </Text>
    </View>
  )
}

const UserScreen = ({navigation}) => {
  return (
    <View style = {styles.container}>
      <Text style = {styles.title}>
        View User Info
      </Text>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  input: {
    width: '80%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
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
    backgroundColor: '#D6E7BB',
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
    backgroundColor: "#80C342",
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