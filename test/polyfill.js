describe('Intl.ListFormat polyfill', function() {
  it('should exist', function() {
    expect(Intl.ListFormat).to.be.an(Object);
  });

  it('should format zero element list', function() {
    const formatter = new Intl.ListFormat();
    const list = [];
    expect(formatter.format(list)).to.be('');
  });

  it('should format one element list', function() {
    const formatter = new Intl.ListFormat();
    const list = ['foo'];
    expect(formatter.format(list)).to.be('foo');
  });

  it('should format two element list', function() {
    const formatter = new Intl.ListFormat();
    const list = ['foo', 'bar'];
    expect(formatter.format(list)).to.be('foo and bar');
  });

  it('should format three element list', function() {
    const formatter = new Intl.ListFormat();
    const list = ['foo', 'bar', 'baz'];
    expect(formatter.format(list)).to.be('foo, bar, and baz');
  });

  it('should format four element list', function() {
    const formatter = new Intl.ListFormat();
    const list = ['foo', 'bar', 'baz', 'qux'];
    expect(formatter.format(list)).to.be('foo, bar, baz, and qux');
  });
});
