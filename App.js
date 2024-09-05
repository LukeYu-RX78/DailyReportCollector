import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack'; 
import { createDrawerNavigator } from '@react-navigation/drawer';


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
        Password TEXT,
        AutorityLv INTEGER
      );
    `);
    console.log('creat account table !!!');
  } catch (error) {
    console.log('Error :', error, ' !!!');
  }
};

const Stack = createStackNavigator();

const Drawer = createDrawerNavigator();

export default function App() {
  return (
    <SQLiteProvider databaseName = 'report.db' onInit = {initDB}>
      <NavigationContainer>
        <Drawer.Navigator initialRouteName='Home'>
          <Drawer.Screen name = 'Login' component={LoginScreen}/>
          <Drawer.Screen name = 'Register' component={RegisterScreen}/>
          <Drawer.Screen name = 'Home' component={HomeScreen}/>
          <Drawer.Screen name = 'Form' component={FormScreen}/>

        </Drawer.Navigator>
      </NavigationContainer>
    </SQLiteProvider>
  );
};


const LoginScreen = ({navigation}) => {
  return (
    <View style = {styles.container}>
      <Text style = {styles.title}>
        Login Page
      </Text>
    </View>
  )
}

const RegisterScreen = ({navigation}) => {
  return (
    <View style = {styles.container}>
      <Text style = {styles.title}>
        Register Page
      </Text>
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

const FormScreen = ({navigation}) => {
  return (
    <View style = {styles.container}>
      <Text style = {styles.title}>
        Form Page
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
    fontWeight: 'bold'

  }
});
