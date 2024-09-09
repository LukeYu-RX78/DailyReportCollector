import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Pressable } from 'react-native';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack'; 
import { createDrawerNavigator } from '@react-navigation/drawer';

import React, { Component } from 'react';
import { AppRegistry } from 'react-native';
import { Button, Provider, Toast } from '@ant-design/react-native';


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
        ContractNo TEXT,
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
          <Drawer.Screen name = 'SignIn' component={LoginScreen}/>
          <Drawer.Screen name = 'SignUp' component={RegisterScreen}/>
          <Drawer.Screen name = 'Home' component={HomeScreen}/>
          <Drawer.Screen name = 'Report' component={ReportScreen}/>
          <Drawer.Screen name = 'From' component={FormScreen}/>
          <Drawer.Screen name = 'CreateReport' component={CreateReportScreen}/>
          <Drawer.Screen name = 'FillingForm' component={FillingFormScreen}/>

        </Drawer.Navigator>
      </NavigationContainer>
    </SQLiteProvider>
  );
};


const LoginScreen = ({navigation}) => {
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
        onPress = {() => navigation.navigate('Register')}
      >
        <Text style = {styles.linkText}>Don't have an Account? Sign up</Text>
      </Pressable>
    </View>
  )
}

const RegisterScreen = ({navigation}) => {
  return (
    <View style = {styles.container}>
      <Text style = {styles.title}>
        Sign Up Page
      </Text>
      <TextInput 
        style = {styles.input}
        placeholder='First Name'
      />
      <TextInput 
        style = {styles.input}
        placeholder='Middle Name'
      />
      <TextInput 
        style = {styles.input}
        placeholder='Last Name'
      />
      <TextInput 
        style = {styles.input}
        placeholder='Email Address'
      />
      <TextInput 
        style = {styles.input}
        placeholder='Password'
        secureTextEntry
      />
      <TextInput 
        style = {styles.input}
        placeholder='Confirm password'
        secureTextEntry
      />
      <TextInput 
        style = {styles.input}
        placeholder='Organization'
        secureTextEntry
      />
      <TextInput 
        style = {styles.input}
        placeholder='Position'
        secureTextEntry
      />
      <Pressable 
        style = {styles.button} 
        onPress = {() => navigation.navigate('Home')}
      >
        <Text style = {styles.buttonText}>Sign up</Text>
      </Pressable>
      <Pressable 
        style = {styles.link}
        onPress = {() => navigation.navigate('Login')}
      >
        <Text style = {styles.linkText}>Already have an account? Sign in</Text>
      </Pressable>
    </View>
  )
}

const HomeScreen = ({navigation}) => {
  return (
    <View style = {styles.container}>
      <Text style = {styles.title}>
        Home Page
      </Text>
    </View>
  )
}

const ReportScreen = ({navigation}) => {
  return (
    <View style = {styles.container}>
      <Text style = {styles.title}>
        Report Page
      </Text>
    </View>
  )
}

const FormScreen = ({navigation}) => {
  return (
    <View style = {styles.container}>
      <Text style = {styles.title}>
        Table Page
      </Text>
    </View>
  )
}

const CreateReportScreen = ({navigation}) => {
  return (
    <View style = {styles.container}>
      <Text style = {styles.title}>
        Create new report Page
      </Text>
      <Provider>
        <Button onPress={() => Toast.info('This is a toast tips')}>
          Start
        </Button>
      </Provider>
    </View>
  )
}

const FillingFormScreen = ({navigation}) => {
  return (
    <View style = {styles.container}>
      <Text style = {styles.title}>
        Filling data page
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
