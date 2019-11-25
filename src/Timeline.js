'use strict';

import React, {Component} from 'react';

import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Animated,
  PanResponder,
} from 'react-native';
import moment from 'moment';

export default class Timeline extends Component {
  constructor(props) {
    super(props);
    const {dates, blocks} = props;
    this.state = {
      dates: dates,
      blocks: blocks,
    };
    this.pan = [];
    this.currentPanValue = [];
    this.panListener = [];
  }

  render() {
    const {dates, blocks} = this.props;
    this.pan = blocks.map(() => new Animated.ValueXY());
    this.currentPanValue = blocks.map(() => ({x: 0, y: 0}));
    this.panListener = this.pan.map((pan, index) =>
      pan.addListener(value => (this.currentPanValue[index] = value)),
    );
    return (
      <View style={styles.container}>
        <View style={styles.listview}>
          <FlatList
            data={dates}
            renderItem={this.renderItem}
            automaticallyAdjustContentInsets={false}
            keyExtractor={(item, key) => item.toString() + key}
            {...this.props}
          />
        </View>
        <View style={styles.blockView}>
          {blocks.map((block, i) => this.renderBlock(block, i))}
        </View>
      </View>
    );
  }

  renderItem = ({item, index}) => {
    return (
      <View>
        <View style={styles.rowContainer}>
          <View style={styles.timeContainer}>
            {0 != index ? this.renderTime(item, index) : null}
          </View>
          <View style={styles.lineVerticalContainer}></View>
          <View style={styles.lineRowContainer}>
            {0 != index ? this.renderLineRow(item, index) : null}
          </View>
        </View>
      </View>
    );
  };

  renderTime = (item, index) => {
    return <Text style={styles.time}>{item}</Text>;
  };

  renderLineVertical = (item, index) => {
    return <View style={styles.lineVertical}></View>;
  };

  renderLineRow = () => {
    return <View style={styles.lineRow}></View>;
  };

  renderBlock = (block, index) => {
    console.log('renderBlock', index);

    let startTime = moment(block.startTime);
    let startHour = startTime.hour();
    let startMinutes = startTime.minutes();
    let totalStartMinute = startHour * 60 + startMinutes;
    let top = (totalStartMinute * 50) / 60;

    let endTime = moment(block.endTime);
    let endHour = endTime.hour();
    let endMinutes = endTime.minutes();
    let totalEndMinute = endHour * 60 + endMinutes;
    let durationInMinutes = totalEndMinute - totalStartMinute;
    let height = (durationInMinutes * 50) / 60;
    const panStyle = {
      transform: this.pan[index].getTranslateTransform(),
    };
    return (
      <Animated.View
        {...this.getPanResponder(index).panHandlers}
        key={index}
        style={[panStyle, styles.block, {top: top, height: height}]}>
        <Text style={styles.blockName}>{block.name}</Text>
        {/**
        <View style={[styles.block, { top: top, height: height }]}>
         
        </View>
         */}
      </Animated.View>
    );
  };

  getPanResponder(index) {
    console.log('getPanResponder', index);

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([
        null,
        {
          dx: this.pan[index].x,
          dy: this.pan[index].y,
        },
      ]),
      onPanResponderRelease: (e, gesture) => {
        this.pan[index].setOffset({
          x: this.currentPanValue[index].x,
          y: this.currentPanValue[index].y,
        });
        this.pan[index].setValue({x: 0, y: 0});
      },
    });
  }
}

let styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listview: {
    flex: 1,
  },
  blockView: {
    flex: 1,
    position: 'absolute',
    width: '85%',
    height: '100%',
    left: '15%',
    right: 0,
  },
  block: {
    position: 'absolute',
    width: '100%',
    //height: 100,
    //top: 200,
    backgroundColor: 'rgba(192,192,192, 1 )',
    borderRadius: 15,
    borderColor: 'black',
    borderWidth: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blockName: {},

  rowContainer: {
    flexDirection: 'row',
    flex: 1,
    height: 50,
  },
  timeContainer: {
    width: '10%',
  },
  lineVerticalContainer: {
    borderRightWidth: 0.3,
    width: '5%',
  },
  lineRowContainer: {
    width: '100%',
    left: '12%',
    position: 'absolute',
  },

  time: {
    textAlign: 'right',
    fontSize: 11,
    top: -7,
  },
  lineRow: {
    flex: 1,
    backgroundColor: 'rgba(192,192,192,0.2)',
    borderBottomWidth: 0.3,
  },
});
