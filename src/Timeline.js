'use strict';

import React, {Component} from 'react';

import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Animated,
  PanResponder,
  ScrollView,
} from 'react-native';
import moment from 'moment';

export default class Timeline extends Component {
  _panResponder;
  point = new Animated.ValueXY();
  scrollOffset = 0;
  currentIdx = null;

  constructor(props) {
    super(props);
    const {dates, blocks} = props;
    this.state = {
      dates: dates,
      blocks: blocks,
      dragging: false,
      selectedBlockIndex: null,
    };
    this.pan = [];
    this.currentPanValue = [];
    this.panListener = [];
    this._panResponder = PanResponder.create({
      // Ask to be the responder:
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

      //imp
      onPanResponderGrant: (evt, gestureState) => {
        console.log('onPanResponderGrant Called');
        console.log(JSON.stringify(gestureState));
        this.currentIdx = this.getSelectedBlock(
          gestureState.x0,
          gestureState.y0,
        );
        this.setState({
          dragging: true,
          selectedBlockIndex: this.currentIdx,
        });
      },
      //imp
      onPanResponderMove: (evt, gestureState) => {
        Animated.event([{y: this.point.y}])({y: gestureState.moveY});
        // The most recent move distance is gestureState.move{X,Y}
        // The accumulated gesture distance since becoming responder is
        // gestureState.d{x,y}
      },
      onPanResponderTerminationRequest: (evt, gestureState) => false,
      onPanResponderRelease: (evt, gestureState) => {
        console.log('onPanResponderRelease');
        console.log(gestureState.moveY);
        this.updateActivityDateTime(
          this.state.selectedBlockIndex,
          gestureState.moveY,
        );

        // The user has released all touches while this view is the
        // responder. This typically means a gesture has succeeded

        //send moved block index with gesture state required details
        this.setState({
          dragging: false,
          selectedBlockIndex: null,
        });
      },
      onPanResponderTerminate: (evt, gestureState) => {
        // Another component has become the responder, so this gesture
        // should be cancelled
      },
      onShouldBlockNativeResponder: (evt, gestureState) => {
        // Returns whether this component should block native components from becoming the JS
        // responder. Returns true by default. Is currently only supported on android.
        return true;
      },
    });
  }

  render() {
    const {dates, blocks} = this.state;
    return (
      <ScrollView
        style={styles.container}
        scrollEnabled={!this.state.dragging}
        onScroll={e => {
          this.scrollOffset = e.nativeEvent.contentOffset.y;
        }}
        onLayout={event => {
          this.xAxisInitial = event.nativeEvent.layout.width * 0.15;
          this.xAxisFinal = event.nativeEvent.layout.width;
        }}
        scrollEventThrottle={50}>
        <View style={styles.listview}>
          <FlatList
            scrollEnabled={!this.state.dragging}
            data={dates}
            renderItem={this.renderItem}
            keyExtractor={(item, key) => item.toString() + key}
          />
        </View>
        <View
          style={styles.blockView}
          onResponderMove={event => {
            console.log(event.nativeEvent);
          }}>
          {this.state.dragging && (
            <Animated.View
              style={{
                top: this.point.getLayout().top,
                marginVertical: this.scrollOffset,
                width: '100%',
                position: 'absolute',
              }}>
              {this.renderBlock(
                this.getBlockById(this.state.selectedBlockIndex),
                this.state.selectedBlockIndex,
                false,
              )}
            </Animated.View>
          )}
          {blocks.map((block, index) => this.renderBlockSets(block, index))}
        </View>
      </ScrollView>
    );
  }

  updateActivityDateTime = (blockId, top) => {
    var blocks = this.state.blocks;
    for (var i = 0; i < blocks.length; i++) {
      for (var j = 0; j < blocks[i].length; j++) {
        if (blocks[i][j].blockId === blockId) {
          var block = blocks[i][j];
          var minutes = (60 * top) / 50;
          var diff = new Date(block.endTime) - new Date(block.startTime);
          block.startTime = moment(block.startTime)
            .set({
              h: Math.floor(minutes / 60),
              m: Math.floor(minutes % 60),
            })
            .toDate()
            .toISOString();
          block.endTime = moment(block.startTime)
            .add(diff, 'milliseconds')
            .toDate()
            .toISOString();

          blocks[i].splice(j, 1);
          if (blocks[i].length === 0) {
            blocks.splice(i, 1);
          }
          blocks = this.rePopulateBlock(block, blocks);
          this.setState({
            blocks: blocks,
          });
          break;
        }
      }
    }
  };
  rePopulateBlock = (block, blocks) => {
    for (var i = 0; i < blocks.length; i++) {
      for (var j = 0; j < blocks[i].length; j++) {
        if (
          new Date(block.startTime) >= new Date(blocks[i][j].startTime) &&
          new Date(block.startTime) <= new Date(blocks[i][j].endTime)
        ) {
          blocks[i].push(block);
          return blocks;
        }
      }
    }
    blocks.push([block]);
    return blocks;
  };
  getBlockById = blockId => {
    var blocks = this.state.blocks;
    for (var i = 0; i < blocks.length; i++) {
      for (var j = 0; j < blocks[i].length; j++) {
        if (blocks[i][j].blockId === blockId) {
          return blocks[i][j];
        }
      }
    }
    return null;
  };

  renderBlockSets = (blocks, parentIndex) => {
    let width = 100 / blocks.length;
    return blocks.map((block, index) => {
      let marginLeft = index * width;
      return this.renderBlock(
        block,
        parentIndex + '/' + index,
        true,
        width + '%',
        marginLeft + '%',
      );
    });
  };

  renderItem = ({item, index}) => {
    return (
      <View style={styles.rowContainer}>
        <View style={styles.timeContainer}>
          {0 != index && this.renderTime(item, index)}
        </View>
        <View style={styles.lineVerticalContainer}></View>
        <View style={styles.lineRowContainer}>
          {0 != index ? this.renderLineRow(item, index) : null}
        </View>
      </View>
    );
  };

  renderTime = (item, index) => {
    return (
      <Text key={`${item}--${index}`} style={styles.time}>
        {item}
      </Text>
    );
  };

  renderLineVertical = (item, index) => {
    return <View style={styles.lineVertical}></View>;
  };

  renderLineRow = () => {
    return <View style={styles.lineRow}></View>;
  };

  getSelectedBlock = (x0, y0) => {
    var blocks = this.state.blocks;
    for (var i = 0; i < blocks.length; i++) {
      for (var j = 0; j < blocks[i].length; j++) {
        var block = blocks[i][j];
        var length = blocks[i].length;
        var eachBlockLength = (this.xAxisFinal - this.xAxisInitial) / length;
        var blockDimenstion = this.getTopAndHeight(block);
        var clickedPoint = this.scrollOffset + y0;
        var xMin = this.xAxisInitial + eachBlockLength * j;
        var xMax = xMin + eachBlockLength;
        if (
          clickedPoint >= blockDimenstion.top &&
          clickedPoint <= blockDimenstion.top + blockDimenstion.height &&
          x0 >= xMin &&
          x0 <= xMax
        ) {
          return block.blockId;
        }
      }
    }
    return null;
  };
  getTopAndHeight = block => {
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
    return {
      top: top,
      height: height,
    };
  };

  renderBlock = (block, index, forceTop, width = '100%', marginLeft = '0%') => {
    var blockDimenstion = this.getTopAndHeight(block);
    return (
      <View
        {...this._panResponder.panHandlers}
        key={block.blockId}
        style={[
          styles.block,
          {
            width: width,
            marginLeft: marginLeft,
            top: forceTop ? blockDimenstion.top : 0,
            height: blockDimenstion.height,
            zIndex: 1,
            opacity:
              this.state.selectedBlockIndex !== null &&
              this.state.selectedBlockIndex === block.blockId &&
              forceTop
                ? 0.6
                : 1,
          },
        ]}>
        <Text style={styles.blockName}>{block.name}</Text>
      </View>
    );
  };

  getPanResponder(index) {
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
    width: '80%',
    marginLeft: '15%',
    marginRight: '5%',
  },
  block: {
    position: 'absolute',
    backgroundColor: 'rgba(192,192,192, 1 )',
    borderRadius: 7,
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
    borderRightWidth: 1,
    width: '5%',
    borderRightColor: '#DAE1E7',
  },
  lineRowContainer: {
    width: '100%',
    marginLeft: '12%',
    position: 'absolute',
  },

  time: {
    textAlign: 'right',
    marginVertical: -7,
    fontSize: 11,
    color: '#121010',
    opacity: 0.6,
  },
  lineRow: {
    flex: 1,
    backgroundColor: 'rgba(192,192,192,0.2)',
    borderBottomWidth: 1,
    borderBottomColor: '#DAE1E7',
  },
});
