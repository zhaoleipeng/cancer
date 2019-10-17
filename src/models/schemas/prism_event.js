/* eslint comma-dangle: off */

/*
 * !!! Do not change this file !!!
 * Because this file is auto generated,
 * Any changes you make would be overwriten.
 */

const db = require('../../common/db');

const { BIGINT, VARCHAR, DATE } = db.Sequelize;

const PrismEvent = db.define(
  'prismEvent',
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
    eventName: {
      type: STRING(256),
      allowNull: false,
      defaultValue: '',
      primaryKey: false,
      autoIncrement: false,
      comment: '事件名称',
      field: 'event_name',
    },
    eventId: {
      type: STRING(4096),
      allowNull: false,
      defaultValue: '0',
      primaryKey: false,
      autoIncrement: false,
      comment: '事件id',
      field: 'event_id',
    },
    platform: {
      type: STRING(128),
      allowNull: false,
      defaultValue: '',
      primaryKey: false,
      autoIncrement: false,
      comment: '设备平台，如android, ios',
      field: 'platform',
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
  },
  {
    tableName: 'prism_event',
    timestamps: false,
    paranoid: false,
    createdAt: false,
    updatedAt: false,
    deletedAt: false,
  }
);

// Define class methods directly on Model
// PrismEvent.someActionOnModel = function () {};

// Define instance methods on Model's prototype
// PrismEvent.prototype.someActionOnInstance = function () {};

module.exports = PrismEvent;
