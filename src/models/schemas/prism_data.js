/* eslint comma-dangle: off */

/*
 * !!! Do not change this file !!!
 * Because this file is auto generated,
 * Any changes you make would be overwriten.
 */

const db = require('../../common/db');

const { BIGINT, VARCHAR, DATE, TEXT } = db.Sequelize;

const PrismData = db.define(
  'prismData',
  {
    id: {
      type: BIGINT(20),
      allowNull: false,
      defaultValue: null,
      primaryKey: true,
      autoIncrement: true,
      comment: '自增id',
      field: 'id',
    },
    uid: {
      type: BIGINT(20),
      allowNull: false,
      defaultValue: 0,
      primaryKey: false,
      autoIncrement: false,
      comment: '用户uid',
      field: 'uid',
    },
    pid: {
      type: BIGINT(20),
      allowNull: false,
      defaultValue: 0,
      primaryKey: false,
      autoIncrement: false,
      comment: '用户pid',
      field: 'pid',
    },
    eventId: {
      type: STRING(4096),
      allowNull: false,
      defaultValue: '0',
      primaryKey: false,
      autoIncrement: false,
      comment: '事件',
      field: 'event_id',
    },
    eventStartTime: {
      type: DATE,
      allowNull: false,
      defaultValue: '1971-01-01 00:00:00',
      primaryKey: false,
      autoIncrement: false,
      comment: '事件发生事件',
      field: 'event_start_time',
    },
    eventEndTime: {
      type: DATE,
      allowNull: false,
      defaultValue: '1971-01-01 00:00:00',
      primaryKey: false,
      autoIncrement: false,
      comment: '事件结束时间',
      field: 'event_end_time',
    },
    payload: {
      type: TEXT,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '指令数据, json格式',
      field: 'payload',
    },
    createTime: {
      type: DATE,
      allowNull: false,
      defaultValue: 'CURRENT_TIMESTAMP',
      primaryKey: false,
      autoIncrement: false,
      comment: '创建时间',
      field: 'create_time',
    },
    updateTime: {
      type: DATE,
      allowNull: false,
      defaultValue: 'CURRENT_TIMESTAMP',
      primaryKey: false,
      autoIncrement: false,
      comment: '更新时间',
      field: 'update_time',
    },
    appversion: {
      type: STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: 'appversion',
    },
  },
  {
    tableName: 'prism_data',
    timestamps: false,
    paranoid: false,
    createdAt: false,
    updatedAt: false,
    deletedAt: false,
  }
);

// Define class methods directly on Model
// PrismData.someActionOnModel = function () {};

// Define instance methods on Model's prototype
// PrismData.prototype.someActionOnInstance = function () {};

module.exports = PrismData;
