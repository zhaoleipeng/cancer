/* eslint comma-dangle: off */

/*
 * !!! Do not change this file !!!
 * Because this file is auto generated,
 * Any changes you make would be overwriten.
 */

const db = require('../../common/db');

const { BIGINT, INT, VARCHAR, TEXT, DATE } = db.Sequelize;

const PrismConfig = db.define(
  'prismConfig',
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
    cityId: {
      type: INT(11),
      allowNull: false,
      defaultValue: 0,
      primaryKey: false,
      autoIncrement: false,
      comment: '城市id',
      field: 'city_id',
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
    maxEventCount: {
      type: INT(11),
      allowNull: false,
      defaultValue: 0,
      primaryKey: false,
      autoIncrement: false,
      comment: '最大事件数',
      field: 'max_event_count',
    },
    triggerEvent: {
      type: TEXT,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '上报事件, json array',
      field: 'trigger_event',
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
    tableName: 'prism_config',
    timestamps: false,
    paranoid: false,
    createdAt: false,
    updatedAt: false,
    deletedAt: false,
  }
);

// Define class methods directly on Model
// PrismConfig.someActionOnModel = function () {};

// Define instance methods on Model's prototype
// PrismConfig.prototype.someActionOnInstance = function () {};

module.exports = PrismConfig;
