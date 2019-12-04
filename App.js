/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Fragment} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import Timeline from './src/Timeline';

let dates = [
  '12 AM',
  '1 AM',
  '2 AM',
  '3 AM',
  '4 AM',
  '5 AM',
  '6 AM',
  '7 AM',
  '8 AM',
  '9 AM',
  '10 AM',
  '11 AM',
  '12 PM',
  '1 PM',
  '2 PM',
  '3 PM',
  '4 PM',
  '5 PM',
  '6 PM',
  '7 PM',
  '8 PM',
  '9 PM',
  '10 PM',
  '11 PM',
];

let blocks = [
  [
    {
      blockId: 1,
      startTime: '2019-09-16T00:00:00+05:30',
      endTime: '2019-09-16T01:00:00+05:30',
      name: 'Name1',
    },
    {
      blockId: 2,
      startTime: '2019-09-16T00:30:00+05:30',
      endTime: '2019-09-16T02:00:00+05:30',
      name: 'Name2',
    },
    {
      blockId: 8,
      startTime: '2019-09-16T00:15:00+05:30',
      endTime: '2019-09-16T01:40:00+05:30',
      name: 'Name8',
    },
  ],
  [
    {
      blockId: 3,
      startTime: '2019-09-16T07:00:00+05:30',
      endTime: '2019-09-16T08:00:00+05:30',
      name: 'Name3',
    },
    {
      blockId: 4,
      startTime: '2019-09-16T07:30:00+05:30',
      endTime: '2019-09-16T08:00:00+05:30',
      name: 'Name7',
    },
  ],
  [
    {
      blockId: 5,
      startTime: '2019-09-16T10:00:00+05:30',
      endTime: '2019-09-16T11:00:00+05:30',
      name: 'Name4',
    },
  ],
  [
    {
      blockId: 6,
      startTime: '2019-09-16T15:00:00+05:30',
      endTime: '2019-09-16T16:00:00+05:30',
      name: 'Name5',
    },
  ],
  [
    {
      blockId: 7,
      startTime: '2019-09-16T19:00:00+05:30',
      endTime: '2019-09-16T20:00:00+05:30',
      name: 'Name6',
    },
  ],
];

const App = () => {
  return <Timeline dates={dates} blocks={blocks} />;
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
    flex: 1,
  },
});

export default App;
