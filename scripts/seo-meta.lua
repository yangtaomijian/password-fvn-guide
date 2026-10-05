local paired_paths = {
  ["index.html"] = true,
  ["discussions.html"] = true,
  ["guide/route-overview.html"] = true,
  ["guide/path-system.html"] = true,
  ["guide/password-hints.html"] = true,
  ["guide/faq.html"] = true,
  ["collectibles/medals.html"] = true,
  ["collectibles/gallery.html"] = true,
  ["collectibles/compendium.html"] = true,
  ["mechanics/password-checks.html"] = true,
  ["mechanics/medal-persistence.html"] = true,
  ["mechanics/affection.html"] = true,
  ["mechanics/affection-differences.html"] = true,
  ["versions/b085-changes.html"] = true,
  ["versions/legacy-routes.html"] = true,
  ["versions/legacy-passwords.html"] = true,
  ["versions/legacy-mechanics.html"] = true,
  ["extras/easter-eggs.html"] = true
}

local output_paths = {
  ["index.html"] = "index.html",
  ["discussions.html"] = "discussions.html",
  ["route-overview.html"] = "guide/route-overview.html",
  ["path-system.html"] = "guide/path-system.html",
  ["password-hints.html"] = "guide/password-hints.html",
  ["faq.html"] = "guide/faq.html",
  ["medals.html"] = "collectibles/medals.html",
  ["compendium.html"] = "collectibles/compendium.html",
  ["gallery.html"] = "collectibles/gallery.html",
  ["password-checks.html"] = "mechanics/password-checks.html",
  ["medal-persistence.html"] = "mechanics/medal-persistence.html",
  ["affection.html"] = "mechanics/affection.html",
  ["affection-differences.html"] = "mechanics/affection-differences.html",
  ["b085-changes.html"] = "versions/b085-changes.html",
  ["legacy-routes.html"] = "versions/legacy-routes.html",
  ["legacy-passwords.html"] = "versions/legacy-passwords.html",
  ["legacy-mechanics.html"] = "versions/legacy-mechanics.html",
  ["easter-eggs.html"] = "extras/easter-eggs.html"
}

local function stringify(value)
  if value == nil then
    return nil
  end

  local result = pandoc.utils.stringify(value)
  if result == "" then
    return nil
  end
  return result
end

local function input_page_path()
  local output = (PANDOC_STATE.output_file or ""):gsub("\\", "/")
  local output_name = output:match("([^/]+)$")
  if output_name and output_paths[output_name] then
    return output_paths[output_name]
  end

  local input = (PANDOC_STATE.input_files or {})[1] or "index.md"
  input = input:gsub("\\", "/")
  input = input:gsub("^.*site%-en/", "")
  input = input:gsub("^.*password%-b085%-guide/", "")
  input = input:gsub("^/+", "")
  input = input:gsub("%.qmd$", ".html")
  input = input:gsub("%.md$", ".html")
  return input ~= "" and input or "index.html"
end

local function trailing_slash(value)
  return (value or ""):gsub("/+$", "") .. "/"
end

local function page_url(site_url, page_path)
  site_url = trailing_slash(site_url)
  if page_path == "index.html" then
    return site_url
  end
  return site_url .. page_path
end

function Meta(meta)
  local page_path = input_page_path()
  local site_url = trailing_slash(stringify(meta["seo-site-url"]))
  local site_title = stringify(meta["seo-site-title"]) or ""
  local page_title = stringify(meta.title) or ""
  local canonical = page_url(site_url, page_path)
  local final_title

  if canonical == site_url then
    local suffix = " – " .. site_title
    if site_title ~= "" and page_title:sub(-#suffix) == suffix then
      page_title = page_title:sub(1, -#suffix - 1)
    end
    final_title = page_title
  elseif page_title == site_title or site_title == "" then
    final_title = page_title
  else
    final_title = page_title .. " – " .. site_title
  end

  meta["seo-final-title"] = pandoc.MetaString(final_title)
  meta["seo-canonical"] = pandoc.MetaString(canonical)
  meta["seo-is-home"] = pandoc.MetaBool(canonical == site_url)
  if paired_paths[page_path] then
    local zh_url = page_url(stringify(meta["seo-zh-site-url"]), page_path)
    local en_url = page_url(stringify(meta["seo-en-site-url"]), page_path)
    meta["seo-has-hreflang"] = pandoc.MetaBool(true)
    meta["seo-zh-url"] = pandoc.MetaString(zh_url)
    meta["seo-en-url"] = pandoc.MetaString(en_url)
  end

  return meta
end
