import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Pressable, Alert } from 'react-native';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack'; 
import { createDrawerNavigator } from '@react-navigation/drawer';

import React, { Component } from 'react';
import { AppRegistry } from 'react-native';
import { Button, Provider, Toast } from '@ant-design/react-native';

import { useState } from 'react';


const initDB = async(db) => {
  try {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS Account (
        UID INTEGER PRIMARY KEY AUTOINCREMENT,
        FirstName TEXT,
        MiddleName TEXT,
        LastName TEXT,
        Organization TEXT,
        Position TEXT,
        EmailAddress TEXT UNIQUE,
        Password TEXT,
        AutorityLv INTEGER
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
    console.log('creat tables in SQlite !');
  } catch (error) {
    console.log('Error :', error, ' !');
  }
};

const Stack = createStackNavigator();

const Drawer = createDrawerNavigator();

export default function App() {
  return (
    <SQLiteProvider databaseName = 'report.db' onInit = {initDB}>
      <NavigationContainer>
        <Drawer.Navigator initialRouteName='Home'>
          <Drawer.Screen name = 'SignIn' component={SignInScreen}/>
          <Drawer.Screen name = 'SignUp' component={SignUpScreen}/>
          <Drawer.Screen name = 'Home' component={HomeScreen}/>
          <Drawer.Screen name = 'AllReports' component={ReportsScreen}/>
          <Drawer.Screen name = 'ReportFroms' component={FormsScreen}/>
          <Drawer.Screen name = 'NewReport' component={NewReportScreen}/>
          <Drawer.Screen name = 'EditForm' component={EditFormScreen}/>
          <Drawer.Screen name = 'UserInfo' component={UserScreen}/>
        </Drawer.Navigator>
      </NavigationContainer>
    </SQLiteProvider>
  );
};


const SignInScreen = ({navigation}) => {
  return (
    <View style = {styles.container}>
      <Text style = {styles.title}>
        Sign In Page
      </Text>
      <TextInput 
        style = {styles.input}
        placeholder='Please enter your email'
      />
      <TextInput 
        style = {styles.input}
        placeholder='Please enter your password'
        secureTextEntry
      />
      <Pressable 
        style = {styles.button} 
        onPress = {() => navigation.navigate('Home')}
      >
        <Text style = {styles.buttonText}>Sign in</Text>
      </Pressable>
      <Pressable 
        style = {styles.link}
        onPress = {() => navigation.navigate('SignUp')}
      >
        <Text style = {styles.linkText}>Don't have an Account? Sign up</Text>
      </Pressable>
    </View>
  )
}

const SignUpScreen = ({navigation}) => {

  const db = useSQLiteContext();


  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [organization, setOrganization] = useState('Stark Industries');
  const [position, setPosition] = useState('EMPLOYEE');
  const [autorityLv, setAutorityLv] = useState('3');

  /*
  const handleSignUp = async() => {
    if (firstName.length === 0 || lastName.length === 0 
      || organization.length === 0 || emailAddress.length === 0 
      || password === 0 || confirmPassword === 0)
    {
      Alert.alert('First and last name, organization, email address, password and confirmpassword can not be null!');
      return;
    }
    if (confirmPassword !== password) {
      Alert.alert('Password do not match!')
    }
    try {
      const existingUser = await db.getFirstAsync('SELECT * FROM Account where EmailAddress = ?', [emailAddress]);
      if (existingUser) {
        Alert.alert('This email address has alredy been used.');
        return;
      }
      await db.runAsync('INSERT INTO Account (FirstName, MiddleName, LastName, Organization, Position, ContractNo, EmailAddress, Password, AuthorityLv) VALUES ('Luke', NULL, 'Yu', 'EarthSQL', 'Developer', '0000000000', 'luke.yu@earthsql.com', '123456', '6');')
    }

  }*/

  return (
    <View style = {styles.container}>
      <Text style = {styles.title}>
        Sign Up Page
      </Text>
      <TextInput 
        style = {styles.input}
        placeholder ='First Name'
        Value =  {firstName}
        onChange={setFirstName}
      />
      <TextInput 
        style = {styles.input}
        placeholder ='Middle Name'
        Value =  {middleName}
        onChange={setMiddleName}
      />
      <TextInput 
        style = {styles.input}
        placeholder ='Last Name'
        Value =  {lastName}
        onChange={setLastName}
      />
      <TextInput 
        style = {styles.input}
        placeholder ='Email Address'
        Value =  {emailAddress}
        onChange={setEmailAddress}
      />
      <TextInput 
        style = {styles.input}
        placeholder ='Password'
        secureTextEntry
        Value =  {password}
        onChange={setPassword}
      />
      <TextInput 
        style = {styles.input}
        placeholder ='Confirm password'
        secureTextEntry
        Value =  {confirmPassword}
        onChange={setConfirmPassword}
      />
      <TextInput 
        style = {styles.input}
        placeholder ='Organization'
        Value =  {organization}
        onChange={setOrganization}
      />
      <TextInput 
        style = {styles.input}
        placeholder ='Position'
        Value =  {position}
        onChange={setPosition}

      />
      <Pressable 
        style = {styles.button} 
        onPress = {() => navigation.navigate('Home')}
      >
        <Text style = {styles.buttonText}>Sign up</Text>
      </Pressable>
      <Pressable 
        style = {styles.link}
        onPress = {() => navigation.navigate('SignIn')}
      >
        <Text style = {styles.linkText}>Already have an account? Sign in</Text>
      </Pressable>
    </View>
  )
}

const HomeScreen = ({navigation}) => {
  return (
    <View style = {styles.container}>
      <Text style = {styles.home_title}>
        Welcome to Daily Report Collector!
      </Text>
      <Pressable 
        style = {styles.button} 
        onPress = {() => navigation.navigate('SignIn')}
      >
        <Text style = {styles.buttonText}>Sign Out</Text>
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
      <Provider>
        <Button onPress={() => Toast.info('This is a toast tips')}>
          Start
        </Button>
      </Provider>
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
  home_title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 64,
  },
  input: {
    width: '80%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#CCC',
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
  link: {
    marginTop: 10,
  },
  linkText: {
    color: 'blue',
  }
});
