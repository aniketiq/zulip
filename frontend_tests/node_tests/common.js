const noop = () => {};

set_global('$', global.make_zjquery());
const input = $.create('input');
set_global('document', {
    createElement: () => input,
    execCommand: noop,
});

$("body").append = noop;
$(input).val = (arg) => {
    assert.equal(arg, "iago@zulip.com");
    return {
        select: noop,
    };
};

zrequire('common');

function get_key_stub_html(key_text, expected_key, obj_name) {
    const key_stub = $.create(obj_name);
    key_stub.text(key_text);
    key_stub.expected_key = function () {
        return expected_key;
    };
    return key_stub;
}

run_test('basics', () => {
    common.autofocus('#home');
    assert($('#home').is_focused());
});

run_test('phrase_match', () => {
    assert(common.phrase_match('tes', 'test'));
    assert(common.phrase_match('Tes', 'test'));
    assert(common.phrase_match('Tes', 'Test'));
    assert(common.phrase_match('tes', 'Stream Test'));

    assert(!common.phrase_match('tests', 'test'));
    assert(!common.phrase_match('tes', 'hostess'));
});

run_test('copy_data_attribute_value', () => {
    var elem = $.create('.envelope-link');
    elem.data = (key) => {
        if (key === "admin-emails") {
            return "iago@zulip.com";
        }
        return "";
    };
    elem.fadeOut = (val) => {
        assert.equal(val, 250);
    };
    elem.fadeIn = (val) => {
        assert.equal(val, 1000);
    };
    common.copy_data_attribute_value(elem, 'admin-emails');
});

run_test('adjust_mac_shortcuts', () => {
    const keys_to_test_mac = new Map([
        ['Backspace', 'Delete'],
        ['Enter', 'Return'],
        ['Home', 'Fn + ←'],
        ['End', 'Fn + →'],
        ['PgUp', 'Fn + ↑'],
        ['PgDn', 'Fn + ↓'],
        ['X + Shift', 'X + Shift'],
        ['⌘ + Return', '⌘ + Return'],
        ['Enter or Backspace', "Return or Delete"],
    ]);
    const keys_to_test_non_mac = new Map([
        ['Backspace', 'Backspace'],
        ['Enter', 'Enter'],
        ['Home', 'Home'],
        ['End', 'End'],
        ['PgUp', 'PgUp'],
        ['PgDn', 'PgDn'],
        ['X + Shift', 'X + Shift'],
        ['⌘ + Return', '⌘ + Return'],
    ]);

    var key_no;
    var keys_elem_list = [];

    common.has_mac_keyboard = function () { return false; };
    key_no = 1;
    keys_to_test_non_mac.forEach(function (value, key) {
        keys_elem_list.push(get_key_stub_html(key, value, "hotkey_non_mac_" + key_no));
        key_no += 1;
    });

    common.adjust_mac_shortcuts(".markdown_content");
    keys_elem_list.forEach(function (key_elem) {
        assert(key_elem.text(), key_elem.expected_key());
    });

    keys_elem_list = [];
    key_no = 1;
    common.has_mac_keyboard = function () { return true; };
    keys_to_test_mac.forEach(function (value, key) {
        keys_elem_list.push(get_key_stub_html(key, value, "hotkey_" + key_no));
        key_no += 1;
    });

    $(".markdown_content").each = (f) => {
        for (var key_id = 0; key_id < keys_elem_list.length; key_id += 1) {
            f.call(keys_elem_list[key_id]);
        }
    };
    common.adjust_mac_shortcuts(".markdown_content");
    keys_elem_list.forEach(function (key_elem) {
        assert.equal(key_elem.text(), key_elem.expected_key());
    });
});
