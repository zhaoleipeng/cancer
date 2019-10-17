/* eslint comma-dangle: off */

/*
 * !!! Do not change this file !!!
 * Because this file is auto generated,
 * Any changes you make would be overwriten.
 */

const db = require('../../common/db');

const { BIGINT, VARCHAR, DATE } = db.Sequelize;

const PrismDataEvents = db.define(
  'prismDataEvents',
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
    eventId: {
      type: STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: 'event_id',
    },
    eventTime: {
      type: DATE,
      allowNull: false,
      defaultValue: '1971-01-01 00:00:00',
      primaryKey: false,
      autoIncrement: false,
      comment: '事件发生事件',
      field: 'event_time',
    },
    parentId: {
      type: BIGINT(20),
      allowNull: false,
      defaultValue: 0,
      primaryKey: false,
      autoIncrement: false,
      comment: '父id为prisma的数据表',
      field: 'parent_id',
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
    tableName: 'prism_data_events',
    timestamps: false,
    paranoid: false,
    createdAt: false,
    updatedAt: false,
    deletedAt: false,
  }
);

// Define class methods directly on Model
// PrismDataEvents.someActionOnModel = function () {};

// Define instance methods on Model's prototype
// PrismDataEvents.prototype.someActionOnInstance = function () {};

module.exports = PrismDataEvents;
