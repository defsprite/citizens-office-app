class SimpleHashRingBuffer < Hash


  def initialize(max_keys = 4096)
    @max_keys = max_keys - 1
  end


  def []=(key, value)
    if self.size > @max_keys
      self.shift
    end
    super
  end


  alias :store :[]=

end
