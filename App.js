import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Pressable, Alert } from 'react-native';
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
            CREATE TABLE IF NOT EXISTS DrillReport (
              RefID INTEGER PRIMARY KEY AUTOINCREMENT,
              UID INTEGER,
              ContractNo TEXT,
              Client TEXT,
              RigID TEXT,
              Department TEXT,
              Date TEXT,
              Shift TEXT,
              Day TEXT,
              DayType TEXT,
              MachineHrsFrom REAL,
              MachineHrsTo REAL,
              Location TEXT,
              TotalMetres REAL,
              DrillingHrs REAL,
              [Metres/DrillingHr] REAL,
              TotalActivityHrs REAL,
              [Metres/TotalHr] REAL,
              Comments TEXT,
              ReportState INTEGER
            );
            CREATE TABLE IF NOT EXISTS Drilling (
              DID INTEGER PRIMARY KEY AUTOINCREMENT,
              RefID INTEGER,
              HoleID TEXT,
              Angle REAL,
              DrillType TEXT,
              Size TEXT,
              [From] REAL,
              [To] REAL,
              TotalMetres REAL,
              Barrel TEXT,
              RecovMetres REAL,
              DCIMetres REAL,
              [N/CMetres] REAL
            );
            CREATE TABLE IF NOT EXISTS AziAligner (
              AziID INTEGER PRIMARY KEY AUTOINCREMENT,
              RefID INTEGER,
              HoleID TEXT,
              Dip REAL,
              Azimuth REAL
            );
            CREATE TABLE IF NOT EXISTS LookupList (
              ContractNo TEXT,
              Attribute TEXT,
              Options TEXT
            );
        `);
        console.log('Database initialized !');
    } catch (error) {
        console.log('Error while initializing the database : ', error);
    }
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
                <Drawer.Screen name = 'AllReports' component={ReportsScreen}/>
                <Drawer.Screen name = 'ReportFroms' component={FormsScreen}/>
                <Drawer.Screen name = 'NewReport' component={NewReportScreen}/>
                <Drawer.Screen name = 'EditForm' component={EditFormScreen}/>
                <Drawer.Screen name = 'UserInfo' component={UserScreen}/>
            </Drawer.Navigator>
        </NavigationContainer>
    </SQLiteProvider>
  );
}

const LoginScreen = ({navigation}) => {

    const db = useSQLiteContext();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    //function to handle login logic
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


const ReportsScreen = ({navigation}) => {
  return (
    <View style = {styles.container}>
      <Text style = {styles.title}>
        View All Reports
      </Text>
    </View>
  )
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
  }
});