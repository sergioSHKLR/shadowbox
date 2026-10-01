                {related.length ? (
                  <section>
                    <h3>Connected in this record</h3>
                    <ul className="related">
                      {related.map((item) => (
                        <li key={item.kind + item.id + item.label}>
                          <button type="button" onClick={() => onSelect({ kind: item.kind, id: item.id })}>
                            {item.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}