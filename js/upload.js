/**
 * Created by LuLuAny on 2017/2/21.
 */
(function (factory) {
    if ("undefined" == typeof jQuery) throw new Error("jQuery not loaded");
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        factory(require('jquery'));
    } else {
        factory(jQuery);
    }
})(function ($) {
        function _fn() {
            this.support = {
                addHistory: !!$('[data-addHisory]').length
            };
        }

        _fn.prototype.upload = function () {
            function _upload() {

            }

            _upload.prototype = {
                support: {
                    fileList: !!$('<input type="file">').prop('files'),
                    blobURLs: !!window.URL && URL.createObjectURL,
                    formData: !!window.FormData
                },
                init: function () {
                    this.support.datauri = this.support.fileList && this.support.blobURLs;
                    this.addListener();
                },
                addListener: function () {
                    $(document).on('change', '.upload input[type="file"]', $.proxy(this.change, this));
                    $(document).on('click', '.upload-show .upload-del', $.proxy(this.del, this));
                },
                change: function (e) {
                    var files;
                    var file;
                    this.$action = $(e.currentTarget);
                    this.$parent = this.$action.parents('.upload');
                    this._number = this.$parent.data().uploadNumber || 1;
                    if (this.support.datauri) {
                        files = this.$action.prop('files');
                        if (files.length > 0) {
                            file = files[0];
                            if (this.isImageFile(file)) {
                                if (this.url) {
                                    URL.revokeObjectURL(this.url);
                                }

                                this.url = URL.createObjectURL(file);
                                this.addImage();
                            }
                        }
                    }
                },
                isImageFile: function (file) {
                    if (file.type) {
                        return /^image\/\w+$/.test(file.type);
                    } else {
                        return /\.(jpg|jpeg|png|gif)$/.test(file);
                    }
                },
                uploadTmpl: function () {
                    var $teml = $('<label/>').addClass('upload').attr('data-upload-number', this._number);
                    $teml.append($('<i/>').text('点击添加图片')).append($('<input/>').attr({
                        'name': 'files[]',
                        'type': 'file'
                    }));
                    return $teml;
                },
                addImage: function () {
                    var $uploadShow = $('<div/>').addClass('upload-show');
                    this.$parent.wrap($uploadShow);
                    var $parent = this.$parent.parents('.upload-show');
                    $parent.append($('<img/>').attr('src', this.url))
                        .append($('<i/>').addClass('upload-del').html('&times;'));
                    if ($parent.parent().find('.upload-show').length < this._number) {
                        this.$parent.parents('.upload-show').after(this.uploadTmpl());
                    }
                },
                del: function (e) {
                    var $del = $(e.currentTarget);
                    var $parent = $del.parents('.upload-show').parent();
                    this.$parent = $del.parents('.upload-show').find('.upload');
                    this._number = this.$parent.data().uploadNumber || 1;
                    var num = $parent.find('.upload-show').length;
                    $del.parents('.upload-show').remove();
                    if (num >= this._number) {
                        $parent.append(this.uploadTmpl());
                    }

                }
            };

            return new _upload;
        }();

        _fn.prototype.addInfo = function () {
            function _addInfo() {

            }

            _addInfo.prototype = {
                init: function () {
                    this.addListener();
                },
                addListener: function () {
                    $(document).on('click', '.info-Staff', $.proxy(this.staff, this));
                },
                staff: function () {
                    this._formData = new FormData($('#addStaff form'));
                    var _this = this;
                    $.ajax({
                        type: 'POST',
                        url: '',
                        data: _this._formData,
                        success: function (d) {
                            var $action = $('<td/>').addClass('addStaff-action')
                                .append($('<div/>').addClass('del').text('删除'))
                                .append($('<div/>').addClass('edit').text('编辑').attr({
                                    'data-toggle': 'modal',
                                    'data-target': '#addStaff'
                                }));
                            var $d = $('<tr/>').append($('<td/>').text(d.id))
                                .append($('<td/>').text(d.name))
                                .append($('<td/>').text(d.type))
                                .append($action);
                            $('.addStaff table tbody').append($d)
                        }
                    });
                }
            };
            return new _addInfo;
        }();

        _fn.prototype.tabs = function () {
            function _tabs() {
                this._active = 'active';
                this.current = 'current';
                this.$tabs = $('.facility-tab');
            }

            _tabs.prototype = {
                init: function () {
                    this.setOption();
                    this.addListener();
                },
                getOption: function (name) {
                    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
                    var r = window.location.search.substr(1).match(reg);
                    if (r != null) {
                        if ($.isNumeric(unescape(r[2])))return unescape(r[2]) > 9 || unescape(r[2]) < 0 ? 0 : unescape(r[2]);
                    }
                    return 0;
                },
                setOption: function () {
                    this._number = parseInt(this.getOption('tabs'));
                    var $tab = this.$tabs.find('.tabs');
                    var _this = this;
                    $.each($tab, function (i) {
                        if (i < _this._number) {
                            $(this).addClass('done');
                        } else if (i == _this._number) {
                            $(this).addClass('done ' + _this.current);
                            $('[data-facility="#' + (_this._number + 1) + '"]').addClass(_this._active);
                        }
                    });
                },
                addListener: function () {
                    $(document).on('click', '.facility-tab .tabs', $.proxy(this.startTabs, this));
                    $(document).on('click', '.facility-save', $.proxy(this.save, this));
                    $(document).on('click', '.facility-submit', $.proxy(this.submitDone, this));
                },
                startTabs: function (e) {
                    e.preventDefault();
                    this.$action = $(e.currentTarget);
                    if (!this.$action.is('.done')) {
                        return false;
                    }
                    this.$active = $('.facility').find('.tabs.' + this.current);
                    this.$panel = $('.facility').find('.' + this._active + '[data-facility]');
                    this._hash = this.$action[0].hash;
                    if (this._hash && !this.$action.is(this._active)) {
                        this.$active.removeClass(this.current).addClass('done');
                        this.$panel.removeClass(this._active);
                        this.$action.addClass(this.current);
                        $('[data-facility="' + this._hash + '"]').addClass(this._active);
                    }
                },
                save: function () {
                    this.$active = $('.facility').find('.tabs.' + this.current);
                    this.$active.addClass('done');
                    if (!!this.$active.length) {
                        this._hash = this.$active[0].hash;
                    } else {
                        this._hash = "#10";
                    }
                    this.$panel = $('[data-facility="' + this._hash + '"]');
                    var num = parseInt(this._hash.substring(1)) + 1;
                    this.$action = $('[href="#' + num + '"]');
                    if (!!this.$action.length) {
                        this.$panel.removeClass(this._active);
                        $('[data-facility="#' + num + '"]').addClass(this._active);
                        $(window).scrollTop(0);
                    } else {
                        if (!$('.facility-content').find('.facility-submit').length) {
                            var $btn = $('<div/>').addClass('col-sm-12 text-center')
                                .append($('<button/>').addClass('btn btn-primary facility-submit')
                                    .css({'padding-left': '57px', 'padding-right': '57px'})
                                    .text('提交评级申请'));
                            $('.facility-content').append($btn);
                        }
                    }
                    this.$active.removeClass(this.current);
                    this.$action.addClass(this.current);
                },
                submitDone: function () {
                    $('a[href="#next"]').trigger('click');
                }
            };
            return new _tabs;
        }();

        _fn.prototype.addHistory = function () {
            function _addHistory() {
                this.className = '[data-addHistory]';
            }

            _addHistory.prototype = {
                init: function () {
                    this.addListener();
                },
                addListener: function () {
                    $(document).on('click', this.className, $.proxy(this._pushState, this));
                },
                _pushState: function () {
                    window.history.pushState();
                }
            };

            return new _addHistory;
        }();

        _fn.prototype.projectEdit = function () {
            function _projectEdit() {
                this.editName = 'project-edit';
                this.saveName = 'project-save';
            }

            _projectEdit.prototype = {
                init: function () {
                    this.addListener();
                },
                addListener: function () {
                    $(document).on('click', '.' + this.editName, $.proxy(this.edit, this));
                    $(document).on('click', '.' + this.saveName, $.proxy(this.save, this));
                },
                getSetting: function (e) {
                    this.$action = $(e.currentTarget).parents('.project');
                    this.$editBtn = this.$action.find('.project-edit');
                    this.$saveBtn = this.$action.find('.project-save');
                    this.$uploadShow = this.$action.find('.upload-show');
                },
                editBtn: function () {
                    this.$saveBtn.removeClass(this.saveName + ' btn-primary').addClass(this.editName).text('编辑');
                },
                saveBtn: function () {
                    this.$editBtn.removeClass(this.editName).addClass(this.saveName + ' btn-primary').text('保存');
                },
                edit: function (e) {
                    this.getSetting(e);
                    this.$action.removeClass('disabled');
                    this.$action.find('input,select').removeAttr('disabled');
                    var $tmpl = _fn_.upload.uploadTmpl().append();
                    this.$uploadShow.append($tmpl).append($('<i/>').addClass('upload-del').html('&times;'));
                    this.saveBtn();
                },
                save: function (e) {
                    this.getSetting(e);
                    this.$action.addClass('disabled');
                    this.$action.find('input,select').attr('disabled');
                    this.$uploadShow.find('label,i').remove();
                    this.editBtn();
                }
            };

            return new _projectEdit;
        }();

        var _fn_ = new _fn;
        _fn_.upload.init();
        _fn_.addInfo.init();
        _fn_.tabs.init();
        _fn_.projectEdit.init();
    }
);